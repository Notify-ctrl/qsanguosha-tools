const vscode = require('vscode');
const snippets = require('./snippets.json')

function activate(context) {
	let completion = vscode.languages.registerCompletionItemProvider({language: 'lua', scheme: 'file'}, {
		provideCompletionItems(document, position) {
			const line = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
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
