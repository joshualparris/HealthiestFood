"""Inspect official Australian Broadcasting Corporation podcast RSS enclosures.
No audio is downloaded or republished. Emit recent podcast titles and original file hosts.
"""
import urllib.request,xml.etree.ElementTree as ET,re,urllib.parse
FEEDS={'rash':'https://www.abc.net.au/feeds/12017248/podcast.xml','health-stories':'https://www.abc.net.au/feeds/2887252/podcast.xml','health-full':'https://www.abc.net.au/feeds/2887248/podcast.xml'}
for label,url in FEEDS.items():
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; HealthiestFoodPodcastIndex/1.0)'})
  with urllib.request.urlopen(req,timeout=40) as res: data=res.read()
  root=ET.fromstring(data)
  items=root.findall('.//channel/item')
  print('FEED',label,'items',len(items),'bytes',len(data),flush=True)
  for i in items[:8]:
   e=i.find('enclosure')
   print('ITEM',repr(i.findtext('title')), 'date',i.findtext('pubDate'),'enclosure',urllib.parse.urlsplit(e.get('url') if e is not None else '').netloc,'suffix',(e.get('type') if e is not None else ''),flush=True)
  for term in ['Mediterranean','protein do you','calcium supplements','fish oil','early dinner','seed oils','butter vs','intermittent fasting','fruit and vegetable prescription','problem with nutritional research','ultraprocessed','protein','salt','gut microbiome','vegetarian','diet vs exercise','fruit']:
   ms=[(i.findtext('title'),i.findtext('pubDate')) for i in items if term.casefold() in (i.findtext('title') or '').casefold()]
   if ms:print('MATCH',label,term,ms[:5],flush=True)
 except Exception as exc:print('ERROR',label,repr(exc),flush=True)
