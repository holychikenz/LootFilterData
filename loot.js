class lootshow {
  constructor(data){
    this.data = data
    Promise.all([
      getJSON("https://raw.githubusercontent.com/holychikenz/MarketBackup/main/latest.json"),
      getJSON("https://raw.githubusercontent.com/holychikenz/ISMonkey/main/data/places.json")
    ]).then( data => {
      this.itemdata = {}
      for(let info of data[0].manifest){
        this.itemdata[info.name] = info.minPrice
      }
      this.places = data[1]
      this.buildUI()
    })
  }
  buildUI(){
    let self = this
    let log = self.data
    self.dom = document.createElement("div")
    //self.dom.innerText = JSON.stringify(log)
    let zoneSelector = document.getElementById("zone")
    for( const [key, value] of Object.entries(log) ){
      if( typeof(self.places[key]) === 'undefined' ){
        continue
      }
      let newoption = document.createElement("option")
      newoption.value=key
      newoption.innerText=self.places[key]
      zoneSelector.append(newoption)
    }
    zoneSelector.addEventListener("change", ()=>self.updateView(self));
    let kph = document.getElementById("kph")
    let th = document.getElementById("treasure")
    let scroll = document.getElementById("scroll")
    kph.addEventListener("change", ()=>self.updateView(self))
    th.addEventListener("change", ()=>self.updateView(self))
    scroll.addEventListener("change", ()=>self.updateView(self))
    self.updateView(self)
    document.body.append(self.dom)
  }
  updateView(self){
	// Gets TH and scroll info
    let th = parseFloat(document.getElementById("treasure").value)
    let loot = parseFloat(document.getElementById("scroll").value)
    let n = Math.floor(loot)
    let lootMult = n*(n+1)/(2*loot) + (n + 1) * (loot - n) / loot
    let modifier = 1*(1 + 0.03*th)*lootMult
    let zoneSelector = document.getElementById("zone")
    let zonevalue = zoneSelector.value
    let msg = ''
    let dtable = {}
    for( const [zone, zoneDict] of Object.entries(self.data) ){
      if( zone === zonevalue ){
        for( const [monster, monInfo] of Object.entries(zoneDict) ){
          dtable[monster] = monInfo
        }
      }
    }

    self.dom.innerHTML = ""
    let newdiv = document.createElement("div")
    // Convert dictionary to a set of tables
    let zoneMarket = 0
    for( const [monster, log] of Object.entries(dtable) ){
		// fixing kills to take th into consideration
	  let modified_kills = log.kills / modifier
	  
      let market = 0
      let title = document.createElement("h3")
      title.className = "text-light"
      newdiv.append(title)
      let table = document.createElement("table")
      table.className="table table-dark"
      let head = document.createElement("tr")
      let itemName = document.createElement("th")
      itemName.innerText = "Drop"
      // Sortable
      itemName.addEventListener('click', ()=>sortTable(table, 0))
      let dropCount = document.createElement("th")
      dropCount.innerText = "Kills / Drop"
      dropCount.addEventListener('click', ()=>sortTable(table, 1, "num"))
      let dropFreq = document.createElement("th")
      dropFreq.innerText = "Drop Frequency"
      dropFreq.addEventListener('click', ()=>sortTable(table, 2, "num"))
      let goldPerKill = document.createElement("th")
      goldPerKill.innerText = "Gold Per Kill"
      goldPerKill.addEventListener('click', ()=>sortTable(table, 3, "num"))
      let rollRangeHead = document.createElement("th")
      rollRangeHead.innerText = "Range"
      rollRangeHead.addEventListener('click', ()=>sortTable(table, 4, "num"))
      head.append(itemName)
      head.append(dropCount)
      head.append(dropFreq)
      head.append(goldPerKill)
      head.append(rollRangeHead)
      table.append(head)
      for( const [item, stats] of Object.entries(log.loot) ){
        let row = document.createElement("tr")
        let name = document.createElement("td")
        name.innerText = item
        row.append(name)
        let total = document.createElement("td")
        row.append(total)
        //console.log(item, stats)
        total.innerText = (modified_kills/stats.count).toFixed(2)
        let frequency = document.createElement("td")
        row.append(frequency)
        frequency.innerText = (stats.count/modified_kills).toFixed(4)
        let goldpk = document.createElement("td")
        row.append(goldpk)
        table.append(row)
        // Get market value
        let marketValue = self.itemdata[item]
        marketValue = (typeof(marketValue) === 'undefined')? 1 : marketValue
        let gpk = marketValue * (stats.count/modified_kills)
        goldpk.innerText = gpk.toFixed(2)
        market += gpk
        // Roll Range
        let rangetd = document.createElement("td")
        row.append(rangetd)
        let rollRange = `${stats.min} - ${stats.max}`
        rangetd.innerText = rollRange
      }
      // add to zoneMarket
      try{
        if( monster in zoneFrequency[zonevalue] ){
          zoneMarket += market * zoneFrequency[zonevalue][monster]
        }
      } catch(error) {};
      newdiv.append(table)
      // Default sort
      sortTable(table, 1, "num")
      // Summary in header
      title.innerText = `${monster}: ${numberWithCommas((modified_kills).toFixed(0))} kills -> ${numberWithCommas(market.toFixed(0))} gp/kill`
    }
    // Update GPH
    let kph = document.getElementById("kph")
    let gph = document.getElementById("gph")
    gph.innerText = numberWithCommas((zoneMarket * kph.value * (1+th*0.03) * lootMult).toFixed(0))
    msg = JSON.stringify(dtable)
    //self.dom.innerText=msg
    self.dom.append(newdiv)
  }
};

// Simply from w3schools.com
function sortTable(table, n, type="string") {
  var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if( type === "string" ){
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else {
          if (Number(x.innerHTML) > Number(y.innerHTML)){
            shouldSwitch = true;
            break;
          }
        }
      } else if (dir == "desc") {
        if( type === "string" ){
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else {
          if (Number(x.innerHTML) < Number(y.innerHTML)){
            shouldSwitch = true;
            break;
          }
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

const getJSON = async url => {
  try {
    const response = await fetch(url);
    if(!response.ok)
      throw new Error(response.statusText);
    const data = await response.json();
    return data;
  } catch(error) {
    return error;
  }
}

const zoneFrequency = {
  "11": {"Guard": 0.8, "Black Knight": 0.2},
  "12": {"Small Rat":0.3, "Chicken":0.3, "Cow":0.3, "Goblin":0.1},
  "13": {"Deadly Red Spider": 0.4, "Lesser Demon": 0.6},
  "20": {"Greater Demon": 1.0},
  "23": {"Goblin": 4/9, "Imp": 4/9, "Greater Imp": 1/9},
  "26": {"Spriggan": 1.0},
  "27": {"Fire Giant": 1/3, "Ice Giant": 1/3, "Moss Giant": 1/3},
  "28": {"Corrupted Tree": 4/9, "Infected Naga": 4/9, "Bone Giant": 1/9},
  "29": {"Chaos Giant": 1/1.75, "Chaotic Abomination": 0.75/1.75},
  "605": {"Elite Black Knight": 1},
  "606": {"Elite Moss Giant": 1/3, "Elite Ice Giant": 1/3, "Elite Fire Giant": 1/3},
  "607": {"Elite Infected Naga": 2/3, "Elite Bone Giant": 1/3},
  "613": {"Elite Chaos Giant": 1},
  "604": {"Ot_to's Prized Hen":4, "Elite Goblin":3, "Elite Black Knight": 3, "Elite Lesser Demon": 2, "Elite Greater Demon": 1, "Elite Infected Naga": 2, "Elite Bone Giant": 1, "Elite Spriggan": 1, "Elite Fire Giant": 1, "Elite Ice Giant": 1, "Elite Moss Giant": 1, "Elite Chaos Giant": 1, "Giant King": 1, "Enraged Giant King": 1, "Shard of INFO": 1, "Essence of INFO": 1},
  "701": {"Goblin": 7, "Elite Goblin": 3, "Goblin Village": 1},
  "700": {"Chaos Giant": 2, "Elite Chaos Giant": 1, "Elite Fire Giant": 1, "Elite Ice Giant": 1, "Elite Moss Giant": 1, "Enraged Giant King": 1, "Giant King": 1, "Giant's Keep": 1, "The Advisor": 1},
  "702": {"Black Knight": 7, "Black Knight Titan": 4, "Familiar Stranger": 1, "Black Knight's Fortress": 1},
  "705": {"Krampus": 3, "Krampus' Lair": 1},
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
