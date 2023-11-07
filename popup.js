function callOpenAIChat(prompt) {
  const apiKey = '';
  const apiURL = 'https://api.openai.com/v1/chat/completions';

  console.log('Prompt:', prompt);
  document.getElementById('run-button').style.display = 'none';
  document.getElementById('loading-spinner').style.display = 'block';

  const data = {
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  fetch(apiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // Assuming the last message is the completion
      const lastMessage = data.choices[0].message.content;
      console.log('Success:', lastMessage);
      document.getElementById('result-output').value = lastMessage;

      // Hide spinner and show button
      document.getElementById('run-button').style.display = 'block';
      document.getElementById('loading-spinner').style.display = 'none';
    })
    .catch((error) => {
      console.error('Error:', error);

      // Hide spinner and show button
      document.getElementById('run-button').style.display = 'block';
      document.getElementById('loading-spinner').style.display = 'none';
    });
}

function getSelectedText(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: () => window.getSelection().toString(),
      },
      (results) => {
        if (results && results.length > 0) {
          callback(results[0].result);
        } else {
          callback('');
        }
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Load the last used model and prompt
  chrome.storage.sync.get(['model', 'prompt'], function (data) {
    document.getElementById('model-selector').value = data.model || 'gpt-4'; // Default model
    document.getElementById('prompt-input').value = data.prompt || ''; // Default prompt
  });

  // Save the model selection
  document.getElementById('model-selector').addEventListener('change', function () {
    var model = document.getElementById('model-selector').value;
    chrome.storage.sync.set({ model: model });
  });

  // Save the prompt input
  document.getElementById('prompt-input').addEventListener('change', function () {
    var prompt = document.getElementById('prompt-input').value;
    console.log('Save the prompt', prompt);
    chrome.storage.sync.set({ prompt: prompt });
  });

  // Run the model
  document.getElementById('run-button').addEventListener('click', function () {
    getSelectedText(function (selectedText) {
      var prompt =
        document.getElementById('prompt-input').value + ' context:' + selectedText;
      callOpenAIChat(prompt);
    });
  });

  // Copy results to clipboard
  document.getElementById('copy-button').addEventListener('click', function () {
    var results = document.getElementById('result-output').value;
    navigator.clipboard.writeText(results).then(
      function () {
        // Success message or indication
      },
      function (err) {
        // Error handling
      }
    );
  });
});
