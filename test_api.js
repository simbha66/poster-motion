const formData = new FormData();
formData.append('action', 'generateImg');
formData.append('optimizedPrompt', 'poster with the word "சீதா தேவி"');
formData.append('ratio', '16:9');

fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
