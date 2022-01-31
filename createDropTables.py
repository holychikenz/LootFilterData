import json
import numpy as np
import datetime as dt
import os

# Zone specific modifications, this is to determine double rolls
zonegroupsize = {"29":2, "604":10, "700":5, "701":3, "702":3}
# Zone groupsize exceptions, for CW where we don't really know the mult
zonegroupsizeexclude = {"29":[2]}
# Some scrolls are weird (info apparently)
zonescrolloverride = {"604":1}
# Dungeons augment for +0.25 multiplier and +4 TH, start at 700s
# Scrolls augment for +0.1 multiplier and +1 TH, start at 600s

# Read the data directory and create a single final table
# Read data in order:
# Zone, TH, Scroll, GroupLead, GroupSize, MonsterID
def createTables(**kwargs):
  # Here, using what we know about scaling, create a base table for each zone
  baseDict = {}
  pathToFile = os.path.abspath(os.path.dirname(__file__))
  infile = kwargs.get("infile", f"{pathToFile}/summary.json")
  outfile = kwargs.get("outfile", f"{pathToFile}/compiledTables.json")
  with open(infile) as jj:
    data = json.load(jj)['log']
    for (Zone, A) in data.items():
      if Zone not in baseDict:
        baseDict[Zone] = {}
      for (TH, B) in A.items():
        for (Scroll, C) in B.items():
          for (GroupSize, D) in C.items():
            for (GroupLead, E) in D.items():
              for (Monster, F) in E.items():
                ## Throw out data when where the "score" affects the drops
                ## So if groupsize < zonegroupsize -2 or not 1
                if ( zonegroupsize.get(Zone, 1) - 1 > eval(GroupSize) ) and ( eval(GroupSize) != 1 ):
                  continue
                ## Also just annoyances
                if ( eval(GroupSize) in zonegroupsizeexclude.get(Zone, []) ):
                  continue
                if Monster not in baseDict[Zone]:
                  baseDict[Zone][Monster] = {"kills":0, "loot":{}}
                # Find out scroll and group math
                bigmonster = baseDict[Zone][Monster]
                # TH is 3%, if group lead, big boost
                leadboost = (zonegroupsize.get(Zone, 1) - eval(GroupSize))*eval(GroupLead)
                # Scrolls, +1 TH and +10% loot
                scrollLevel = zonescrolloverride.get(Zone, eval(Scroll))
                scrollboost = scrollLevel
                scrollTH = scrollLevel
                # Choose augment bonus based on zone ID
                augMultiplier = 0.10 if eval(Zone) < 700 else 0.25
                augTreasure = 1 if eval(Zone) < 700 else 4
                # Later we can be more precise, for now set bonus based on min/max of 1
                modifier = lootmult(eval(TH)+scrollLevel*augTreasure, 1+scrollLevel*augMultiplier) * (1 + leadboost)
                ## Test
                kills =  F["kills"] * modifier
                bigmonster["kills"] += kills
                for (name, count) in F["loot"].items():
                  if name not in bigmonster["loot"]:
                    bigmonster["loot"][name] = count["total"]
                  else:
                    bigmonster["loot"][name] += count["total"]
  with open(outfile, "w") as jj:
    json.dump(baseDict, jj, indent=2)

def lootmult(treasure, multiplier, low=1, high=1):
  delta = multiplier*(high-low+1)
  phiA = np.floor(delta)
  muA = (np.floor(delta)-1)/2 + low
  phiB = delta - np.floor(delta)
  muB = np.floor(delta) + low
  averageDrop = (phiA*muA + phiB*muB)/(phiA + phiB)
  baseDrop = (high - low)/2 + low
  return (1 + treasure*0.03) * (averageDrop / baseDrop)


if __name__ == '__main__':
  createTables()
