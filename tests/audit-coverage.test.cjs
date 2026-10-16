const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'..');
const read=p=>fs.readFileSync(require('node:path').join(root,p),'utf8');
const entries=s=>s.trim().split('\n').slice(1);
test('all 231 acceptance IDs are tracked in both report and primary tracker',()=>{
 const backlog=entries(read('docs/IMPROVEMENT_BACKLOG_2026-10-17.csv'));
 const audit=entries(read('docs/REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv'));
 const tracker=entries(read('docs/IMPLEMENTATION_TRACKER_2026-10-17.csv'));
 assert.equal(backlog.length,231);
 assert.equal(audit.length,231);
 assert.equal(tracker.length,231);
 for(let i=0;i<231;i++){
  const expected='"HF-'+String(i+1).padStart(3,'0')+'"';
  assert.ok(backlog[i].startsWith(expected+','),expected);
  assert.ok(audit[i].startsWith(expected+','),expected);
  assert.ok(tracker[i].startsWith(expected+','),expected);
  assert.ok(/"(?:implemented_code_tested|partially_implemented|requires_physical_evidence|not_demonstrated)"/.test(audit[i]),expected);
 }
});
