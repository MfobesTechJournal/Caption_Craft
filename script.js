/* Mock generate function so reviewers can test locally */
document.getElementById('generateBtn').addEventListener('click', () => {
  const topic = (document.getElementById('topic').value || 'Example topic').trim();
  const tone = document.getElementById('tone').value;
  const constraint = (document.getElementById('constraint').value || 'No constraint').trim();
  const response = [
    {platform:'Instagram', caption:`[${tone}] Instagram caption for: ${topic} (${constraint})`},
    {platform:'Twitter', caption:`[${tone}] Twitter caption for: ${topic} (${constraint})`},
    {platform:'LinkedIn', caption:`[${tone}] LinkedIn caption for: ${topic} (${constraint})`}
  ];
  const out = document.getElementById('outputArea');
  out.innerHTML = response.map(r => `<section class="card"><h3>${r.platform}</h3><p>${r.caption}</p></section>`).join('');
});
