"""Generate legally linked in-app audio source index from ABC's public podcast RSS enclosures.
Never download, mirror, proxy, alter, or republish any ABC audio. Unmatched episodes fail closed.
Run in GitHub Actions using first-party ABC feeds, checked against media-data.js.
"""
import urllib.request,urllib.error,urllib.parse,xml.etree.ElementTree as ET,json,re,html,unicodedata,datetime,pathlib
FEEDS={
 "rash":"https://www.abc.net.au/feeds/12017248/podcast.xml",
 "health-stories":"https://www.abc.net.au/feeds/2887252/podcast.xml"
}
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/"podcast-streams.js"
def grab(url):
 req=urllib.request.Request(url,headers={'User-Agent':'HealthiestFood/1.0 (public podcast RSS research)'})
 with urllib.request.urlopen(req,timeout=48) as r:return r.read()
def normalized(t):
 t=unicodedata.normalize("NFKD",html.unescape(t)).lower().strip()
 t=re.sub(r"[’‘\u2014\u2013]","'",t)
 t=re.sub(r"[^a-z0-9]+"," ",t)
 return " ".join(t.split())
def load_media():
 js=(ROOT/"media-data.js").read_text(encoding="utf-8")
 match=re.search(r"const items\s*=\s*(\[.*?\])\s*;\s*const topics",js,re.S)
 if not match:raise ValueError("media-data.js changed format")
 return [i for i in json.loads(match.group(1)) if i["kind"]=="podcast"]
def feeds():
 res={}
 for label,url in FEEDS.items():
  root=ET.fromstring(grab(url))
  rows={}
  for item in root.findall(".//channel/item"):
   title=item.findtext("title") or ""
   enclosure=item.find("enclosure")
   u=enclosure.get("url") if enclosure is not None else None
   if not u:continue
   parsed=urllib.parse.urlsplit(u)
   if parsed.scheme!="https" or not parsed.hostname or not parsed.hostname.endswith("akamaized.net"):continue
   rows.setdefault(normalized(title),[]).append({"title":title,"url":u,"published":item.findtext("pubDate"),"feed":url,"type":enclosure.get("type"),"guid":item.findtext("guid")})
  print("SOURCE",label,len(rows),"unique titles",flush=True)
  res[label]=rows
 return res
def verify_head(url,label):
 try:
  req=urllib.request.Request(url,method="HEAD",headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=22) as r:
   ct=(r.headers.get("content-type") or "").lower(); code=r.status
   # Some sources send application/octet-stream, also valid for audio enclosures.
   if code not in (200,206) or ("audio" not in ct and "octet-stream" not in ct):
    print("WARNING_HEAD",label,code,ct)
    return False
   return True
 except Exception as e:print("WARNING_HEAD",label,type(e).__name__,str(e)[:160],flush=True);return False
def main():
 m=load_media();f=feeds();out={};notfound=[]
 for item in m:
  preferred="rash" if "What's That Rash?" in item["publisher"] else "health-stories"
  rows=f[preferred].get(normalized(item["title"]),[])
  # Full episode title and episode publication date are BOTH required to bind the correct audio.
  if len(rows)!=1:
   notfound.append((item["id"],item["title"],preferred,len(rows)));continue
  match=rows[0]
  published=match["published"] or ""
  yr=str(item["date"] or "")[:4]
  if yr and yr not in published:raise ValueError("YEAR mismatch "+item["id"]+" "+published)
  out[item["id"]]={"url":match["url"],"title":match["title"],"publisherUrl":item["url"],"feed":match["feed"],"published":published,"source":"ABC public podcast RSS enclosure"}
  print("MATCHED",item["id"],match["title"],urllib.parse.urlsplit(match["url"]).netloc,flush=True)
 if notfound:raise ValueError("Unmatched official podcast episodes: "+repr(notfound))
 print("VERIFY_ALL_16_ABC_AUDIO_STREAMS",flush=True)
 for item in m:
  ok=verify_head(out[item["id"]]["url"],item["id"])
  out[item["id"]]["headVerified"]=ok
 print("HEAD_VALIDATED",sum(x.get("headVerified") for x in out.values()),"of",len(out),flush=True)
 # Source URLs remain official public podcast enclosures, never mirrored.
 bundle={"source":"Official ABC public podcast RSS enclosure links, no audio hosted or mirrored by HealthiestFood","generated":datetime.datetime.now(datetime.timezone.utc).isoformat(),"count":len(out),"episodes":out}
 js=('/* First-party ABC RSS audio URLs ONLY. No podcast audio is downloaded/hosted. Regenerate from scripts/generate_podcast_sources.py; audio can expire. */\n' +
     "(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;if(root)root.FoodPodcastStreams=data;})(typeof window!=='undefined'?window:null,function(){'use strict';return "+json.dumps(bundle,ensure_ascii=False,sort_keys=True,separators=(",",":"))+";});\n")
 OUT.write_text(js,encoding="utf-8")
 print("WROTE",OUT,len(out),OUT.stat().st_size,flush=True)
if __name__=="__main__":main()
