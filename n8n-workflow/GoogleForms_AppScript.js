function sendToN8N(e) {
    const url = 'N8N_WEBHOOK_URL'; // test url for this project is https://hollobeni.app.n8n.cloud/webhook-test/9bc909c2-dd8f-4f97-84dd-3b61d42e818e

    try { 
        Logger.log('EVENT OBJECT: %s', JSON.stringify(e)); 
    } catch(err) {}

    const payload = {};

    try {
        if (e && e.namedValues) { // if form submit returns namedValues
            for (let key in e.namedValues) {
                const val = e.namedValues[key];
                payload[key] = Array.isArray(val) ? val.join(', ') : val;
        }
        } else if (e && e.response) { // if form submit returns response object 
            const itemResponses = e.response.getItemResponses();
            for (let i = 0; i < itemResponses.length; i++) {
                const r = itemResponses[i];
                const title = r.getItem().getTitle();
                const answer = r.getResponse();
                payload[title] = Array.isArray(answer) ? answer.join(', ') : answer;
            }
        } else if (e && e.values) { // if form submit returns onFormSubmit values
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const sh = ss.getActiveSheet();
            const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
            for (let i = 0; i < headers.length; i++) {
                payload[headers[i]] = e.values[i] || '';
            }
        } else {
            Logger.log('No known event payload found. Full event: ' + JSON.stringify(e));
        }
    } catch (err) {
        Logger.log('Error while parsing event: ' + err);
    }

    try {
        const options = {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        };
        const resp = UrlFetchApp.fetch(url, options);
        Logger.log('n8n response code: ' + resp.getResponseCode() + ' body: ' + resp.getContentText());
    } catch (err) {
        Logger.log('Error sending to n8n: ' + err);
    }
}

function onFormSubmit(e) {
  sendToN8N(e);
}