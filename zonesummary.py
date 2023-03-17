import json
import os

zone='12'

with open("summary.json") as j:
    data = json.load(j)
log = data['log']
printme = {}
if zone in log:
    for a,b in log[zone].items():
        for c,d in b.items():
            for e,p in d.items():
                for j,k in p.items():
                    for mon,stuff in k.items():
                        if( mon not in printme ):
                            printme[mon] = 0
                        printme[mon] += stuff["kills"]
print(printme)
