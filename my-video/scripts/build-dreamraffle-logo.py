# Builds public/dreamraffle/site/logo-9-en.png, the English "The Dream Raffle,
# Back for the 9th Year" logo: the site's Hebrew 9th-year badge
# (hebrew-logo-9.png) with its Hebrew lettering replaced by the "The Dream"
# script from the 7th-year English logo (logo.png), RAFFLE and a curved
# tagline set in Bebas Neue (@fontsource/bebas-neue). Run from a folder
# holding site/ and fonts/package/ with those files.

import math, numpy as np
from PIL import Image, ImageDraw, ImageFont
FONT='fonts/package/files/bebas-neue-latin-400-normal.woff'
base=np.array(Image.open('site/hebrew-logo-9.png').convert('RGBA')).astype(float)
H,W,_=base.shape
PANEL=np.array([171,128,96]); RIB=np.array([41,26,17])
lum=lambda p: p[...,0]*.299+p[...,1]*.587+p[...,2]*.114
L=lum(base)
# 1) erase Hebrew "הגרלת" from the top panel
y0,y1,x0,x1=158,324,104,692
reg=base[y0:y1,x0:x1]; m=lum(reg)>lum(PANEL)+4
reg[m,:3]=PANEL
# 2) erase "החלומות" from the ribbon (between the gold rules)
y0,y1=353,548
reg=base[y0:y1]; m=(lum(reg)>lum(RIB)+4)&(reg[...,3]>0)
reg[m,:3]=RIB
# 3) erase the curved Hebrew tagline: dark pixels outside the badge's brown fill
brown=(np.abs(base[...,:3]-PANEL).sum(-1)<30)&(base[...,3]>200)
for y in range(636,H):
  xs=np.where(brown[y])[0]
  row=base[y]
  if len(xs): lo,hi=xs.min()-4,xs.max()+4
  else: lo,hi=W,-1
  for x in range(W):
    if (x<lo or x>hi) and row[x,3]>0: row[x,3]=0
# leftovers of the tagline just under the ribbon tails
for y in range(596,640):
  for x in range(W):
    if x>=700: edge=632-(x-700)*47/90
    elif x<=95: edge=632-(95-x)*47/90
    else: continue
    if y>edge+2: base[y,x,3]=0
img=Image.fromarray(base.clip(0,255).astype('uint8'),'RGBA')
pad=Image.new('RGBA',(W,H+40),(0,0,0,0)); pad.alpha_composite(img); img=pad
# 4) "The Dream" script cut out of the 7th-year English logo
src=np.array(Image.open('site/logo.png').convert('RGBA')).astype(float)[64:114,60:256]
gold=np.array([192,157,99])
t=((lum(src)-lum(gold))/(255-lum(gold))).clip(0,1)
cut=np.zeros_like(src); cut[...,:3]=255; cut[...,3]=t*255
cut=Image.fromarray(cut.astype('uint8'),'RGBA')
s=470/cut.width; cut=cut.resize((470,round(cut.height*s)),Image.LANCZOS)
img.alpha_composite(cut,(398-cut.width//2, 242-cut.height//2))
d=ImageDraw.Draw(img)
# 5) "RAFFLE"
f=ImageFont.truetype(FONT,220)
bb=d.textbbox((0,0),'RAFFLE',font=f)
w,h=bb[2]-bb[0],bb[3]-bb[1]
d.text((398-w/2-bb[0],451-h/2-bb[1]),'RAFFLE',font=f,fill=(255,255,255,255))
# 6) curved "BACK FOR THE 9TH YEAR" under the badge, tops toward the centre
cx,cy,R=398,379,430
size=92; f=ImageFont.truetype(FONT,size); fs=ImageFont.truetype(FONT,int(size*.55))
glyphs=[]
for ch in 'BACK FOR THE 9':
  glyphs.append((ch,f))
glyphs+= [('T',fs),('H',fs),(' ',f)]
glyphs+= [(c,f) for c in 'YEAR']
track=6
adv=[ (f2.getlength(c)+track) for c,f2 in glyphs]
total=sum(adv)-track
ang_total=total/R
a=-ang_total/2
asc=f.getbbox('B')[1]  # top offset of capitals
cap=f.getbbox('B')[3]-asc
for (c,f2),w in zip(glyphs,adv):
  mid=a+(w-track)/2/R
  if c!=' ':
    box=Image.new('RGBA',(int(w+20),int(cap+16)),(0,0,0,0))
    bd=ImageDraw.Draw(box)
    # capitals fill the box between 8px margins; the small TH hangs from the cap line
    top=(-asc+8) if f2 is f else (-f2.getbbox('T')[1]+8)
    bd.text((10,top),c,font=f2,fill=(41,26,17,255))
    rot=box.rotate(math.degrees(mid),resample=Image.BICUBIC,expand=True)
    px=cx+R*math.sin(mid); py=cy+R*math.cos(mid)
    img.alpha_composite(rot,(int(px-rot.width/2),int(py-rot.height/2)))
  a+=w/R
img.save('logo-9-en.png')
print(img.size)
