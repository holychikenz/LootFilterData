# Loot Filter Data
Files here are pulled from the loot filter server hourly to act
as a mirror (and reduce calls to the actual server api).

[Github Pages View](https://holychikenz.github.io/LootFilterData)

### summary.json
Dictionary containing a sum of all of the drops without any kind of scaling
applied. Top level keys are integers that represent the zone that the drop was
found in, these can be translated into zone names by loading data from 
[HighOnMikey/idlescape-extraction](https://github.com/HighOnMikey/idlescape-extraction/tree/main/data).

There is also a "header" key that can be ignored, which shows the order the
dictionary is nested in, that order is:
```
["Zone", "Treasure Hunter", "Scroll Size", "Group Lead", "Group Size", "Monster Name"]
```
**Zone** is the combat area, which includes dungeons and scrolls

**Treasure Hunter** includes item enchants, global buffs (hopefully -- not tested), and zone TH from scrolls

**Scroll Size** if doing a scroll, what is the aug modifier for treasure (this can apply to zones as well?)

**Group Lead** boolean, leader gets bonus loot if the group is not full (no idea how to handle groups that
are like 3/5 where there are two slots, how does this work for loot?)

**Monster Name** These are the actual drop tables, split into `["kills":Int,"loot":Dict("name":count)]`

