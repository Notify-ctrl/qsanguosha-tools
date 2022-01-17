const vscode = require('vscode');
var snippets = [];
const sgsex_snippets = require('./snippets/sgs_ex.json');
const room_snippets = require('./snippets/room.json');
const card_snippets = require('./snippets/card.json');
const engine_snippets = require('./snippets/engine.json');
const player_snippets = require('./snippets/player.json');
const enum_snippets = require('./snippets/enum.json');
const constructor_snippets = require('./snippets/constructor.json');

var loaded = false;
if (!loaded) {
    snippets.push(...sgsex_snippets);
    snippets.push(...room_snippets);
    snippets.push(...card_snippets);
    snippets.push(...engine_snippets);
    snippets.push(...player_snippets);
    snippets.push(...enum_snippets);
    snippets.push(...constructor_snippets);
    loaded = true;
}

// 获取这一行到目前为止的上一个不是字母的位置，没有的话返回0
function getLastNonLetter(document, position) {
    const line = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
    const result = line.search(/[^a-zA-Z0-9][a-zA-Z0-9]*[a-zA-Z0-9]$/);
    return new vscode.Position(position.line, result === -1 ? 0 : result + 1);
}

function activate(context) {
	let completion = vscode.languages.registerCompletionItemProvider({language: 'lua', scheme: 'file'}, {
		provideCompletionItems(document, position) {
            let prevPosition = new vscode.Position(position.line, Math.max(0, position.character - 1));
            //console.log(document.getText(new vscode.Range(new vscode.Position(position.line, 0), prevPosition)))
			const line = document.getText(new vscode.Range(getLastNonLetter(document, prevPosition), position));
            const afterpos = new vscode.Range(position, new vscode.Position(position.line, position.character + 1));
            const after = document.getText(afterpos);
            
            console.log(line)
            let items = [];

            for (const snippet of snippets) {
                if (snippet.token) {
                    for (const t of snippet.token.split('|')) {
                        if (line === t) {
                            let item = new vscode.CompletionItem(snippet.prefix);
                            item.insertText = new vscode.SnippetString(snippet.body || snippet.prefix);
                            item.documentation = new vscode.MarkdownString(snippet.desc);
                            item.kind = snippet.kind;
                            item.detail = snippet.detail || snippet.prefix;
                            item.additionalTextEdits = (snippet.token.match(/^[\(\[\{]$/) && after.match(/[\}\]\)]/)) ? [vscode.TextEdit.delete(afterpos)] : null;

                            items.push(item);

                            break;
                        }
                    }
                }
            }

            return items;
		}
	}, '.', ':');

	// TODO
    // let hover = vscode.languages.registerHoverProvider({language: 'lua', scheme: 'file'}, {
	// 	provideHover(document, position, token) {
	// 		console.log('Provide hover.')
	// 		return new vscode.Hover('');
	// 	}
	// })

	context.subscriptions.push(completion);
}

exports.activate = activate;

module.exports = {
	activate
};
