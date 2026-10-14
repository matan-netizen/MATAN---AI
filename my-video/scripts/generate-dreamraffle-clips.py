# Animates the Dream Raffle stills with Kling 3.0 Pro (image-to-video) on
# fal.ai, one clip per shot, into public/dreamraffle/clips/<shot>.mp4.
# Uses the fal queue (queue.fal.run) because renders take minutes and a
# synchronous fal.run call is cut off by the session proxy after 30s.
# After a run, list each clip's length (seconds) in CLIPS in
# src/DreamRaffle/theme.ts so the composition plays it.
#
#   FAL_KEY=... python3 scripts/generate-dreamraffle-clips.py [shot ...]
import json, os, subprocess, sys, time, concurrent.futures as cf
OUT=os.path.join(os.path.dirname(__file__),"..","public","dreamraffle","clips")
NEG="blur, distortion, warped text, letters, watermark, morphing faces, extra fingers, low quality, flicker"
SHOTS=[
 ("s1-key","https://v3b.fal.media/files/b/0aae510b/O31sbizMF79BL2Z-AqH_o_1385c396741a43ec8515da6df698a6f3.jpg","5","The golden key slowly rotates in mid-air, golden bokeh particles drift upward, the camera pushes in gently toward the Star of David on the key, smooth cinematic slow motion, luxury commercial"),
 ("s2-jerusalem","https://v3b.fal.media/files/b/0aae5148/MWaNhSH_F_UPrncKTpMLA_31212bd2fbe74f0087c8af14e778f402.jpg","6","Slow cinematic forward dolly across the luxury terrace toward the glass railing, revealing the panoramic golden-hour view of the Old City of Jerusalem, cypress trees sway gently in the breeze, warm light, smooth stabilized motion"),
 ("s3-interior","https://v3b.fal.media/files/b/0aae510b/YCh_ZQRRDpV0P6WgFLhyN_824bbc3cd4da42e89b547b25c14a7836.jpg","6","Slow elegant forward dolly through the luxury living room toward the floor-to-ceiling windows, sunlight flares softly across the lens, sheer curtains move gently, candle flames flicker softly on the Shabbat table, real-estate commercial"),
 ("s6a-torah","https://v3b.fal.media/files/b/0aae510a/uArb6c8UEi7YUgrwaHEPT_FALS2fN2.jpg","3","The two young men learn together, one points to a line in the open Gemara and the other nods and smiles, subtle natural motion, slow push-in, warm documentary feel"),
 ("s6b-medic","https://v3b.fal.media/files/b/0aae510a/i9OVNt8ou5BpLL25dFJCt_vNWbp6qU.jpg","3","The paramedic lifts the new medical monitor and steps into the ambulance, natural confident motion, slight camera push-in, bright documentary feel"),
 ("s6c-idf","https://v3b.fal.media/files/b/0aae510a/d55iVUPqWZyqMW9EoHFws_hCZxxahc.jpg","3","The soldiers smile and stand proudly together as the Israeli flag waves in the breeze, the sun glows over the Jerusalem skyline, slow cinematic push-in, hopeful"),
 ("s7-lock","https://v3b.fal.media/files/b/0aae5148/rDBp4j8LxxGv_4XW2xLvl_8eebd1d8fa6a4ef9b1089cd4ad30a7d1.jpg","5","The golden key turns slowly in the lock with a click, the door begins to swing open and bright warm golden light floods through the opening and fills the frame, smooth cinematic motion, magical yet realistic"),
]
only=sys.argv[1:]
EP="fal-ai/kling-video/v3/pro/image-to-video"
KEY=os.environ.get("FAL_KEY")
def call(method,url,body=None):
  cmd=["curl","-sS","--max-time","60","-X",method,url,"-H","content-type: application/json"]
  if KEY: cmd+=["-H",f"Authorization: Key {KEY}"]
  if body is not None: cmd+=["-d",json.dumps(body)]
  return json.loads(subprocess.run(cmd,capture_output=True,text=True).stdout)
def run(s):
  name,img,dur,prompt=s
  body=dict(start_image_url=img,prompt=prompt,duration=dur,generate_audio=False,negative_prompt=NEG,cfg_scale=0.5)
  job=call("POST",f"https://queue.fal.run/{EP}",body)
  if "status_url" not in job: return f"{name} FAILED {json.dumps(job)[:300]}"
  while call("GET",job["status_url"]).get("status")!="COMPLETED": time.sleep(10)
  res=call("GET",job["response_url"])
  try: url=res["video"]["url"]
  except Exception: return f"{name} FAILED {json.dumps(res)[:300]}"
  subprocess.run(["curl","-sS","-o",f"{OUT}/{name}.mp4",url])
  return f"{name} ok {url}"
with cf.ThreadPoolExecutor(7) as ex:
  for m in ex.map(run,[s for s in SHOTS if not only or s[0] in only]): print(m,flush=True)
