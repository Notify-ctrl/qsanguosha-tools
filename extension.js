const vscode = require('vscode');
const snippets = require('./snippets.json')

// 获取这一行到目前为止的上一个不是字母的位置，没有的话返回0
function getLastNonLetter(document, position) {
    const line = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
    const result = line.search(/[^a-zA-Z][a-zA-Z]+$/);
    return new vscode.Position(position.line, result === -1 ? 0 : result);
}

function activate(context) {
	let completion = vscode.languages.registerCompletionItemProvider({language: 'lua', scheme: 'file'}, {
		provideCompletionItems(document, position) {
            let prevPosition = position;
            prevPosition.character = Math.max(0, prevPosition.character - 1);
			const line = document.getText(new vscode.Range(getLastNonLetter(document, prevPosition), position));
            const afterpos = new vscode.Range(position, new vscode.Position(position.line, position.character + 1));
            const after = document.getText(afterpos);

            let items = [];

            for (const snippet of snippets) {
                if (snippet.token && line.match(new RegExp(`${snippet.token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}(?![^\\w\\n\\s\\r\\-])[\\w\\n\\s\\r\\-]*`))) {
                    let item = new vscode.CompletionItem(snippet.prefix);
                    item.insertText = new vscode.SnippetString(snippet.body);
                    item.documentation = new vscode.MarkdownString(snippet.desc);
                    item.kind = snippet.kind;
                    item.detail = snippet.detail || snippet.prefix;
                    item.additionalTextEdits = (snippet.token.match(/^[\(\[\{]$/) && after.match(/[\}\]\)]/)) ? [vscode.TextEdit.delete(afterpos)] : null;

                    items.push(item);
                }
            }

            return items;
		}
	}, '.', ':', '_');

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
