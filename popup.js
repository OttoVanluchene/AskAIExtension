function callOpenAIChat(prompt) {
  const apiKey = '';
  const apiURL = 'https://api.openai.com/v1/chat/completions';

  console.log('Prompt:', prompt);

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
    })
    .catch((error) => {
      console.error('Error:', error);
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
  getSelectedText(function (selectedText) {
    if (selectedText) {
      document.getElementById('prompt-input').value = selectedText;
    }
  });
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
    chrome.storage.sync.set({ prompt: prompt });
  });

  document.getElementById('run-button').addEventListener('click', function () {
    getSelectedText(function (selectedText) {
      var prompt = selectedText || document.getElementById('prompt-input').value;
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
