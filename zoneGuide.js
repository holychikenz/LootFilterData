class zoneshow {
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
    self.dom = document.getElementById("combatzones")
    self.fightTable = document.createElement("table")
    self.fightTable.className="table table-dark"
    let tableHeader = document.createElement("tr")
    self.fightTable.append(tableHeader)
    function appendFTHead(name) {
      let nhead = document.createElement("th")
      nhead.innerText = name
      tableHeader.append(nhead)
    }
    appendFTHead("Zone")
    appendFTHead("Treasure Hunter")
    appendFTHead("Scroll Level")
    appendFTHead("KPH")
    appendFTHead("GPH")
    self.dom.append(self.fightTable)
    self.rowDictionary = {}
    // Create a table, and then add a row per zone, store this all in localstorage
    //self.dom.innerText = JSON.stringify(log)
    //let zoneSelector = document.getElementById("zone")
    for( const [key, value] of Object.entries(log) ){
      if( typeof(self.places[key]) === 'undefined' ){
        continue
      }
      self.createRow(self, key)
    }
    self.updateView(self)
    document.body.append(self.dom)
  }
  createRow(self, key){
    let newrow = document.createElement("tr")
    self.rowDictionary[key] = newrow
    let name = document.createElement("td")
    name.innerText = self.places[key]
    newrow.append(name)
    function appendLabelElement(key, name){
      let td = document.createElement("td")
      let input = document.createElement("input")
      input.id = `${key}_${name}`
      let local = localStorage[`${key}_${name}`]
      if( typeof(local) !== 'undefined' ){
        input.value = local
      } else {
        input.value = 0
      }
      input.size = 6
      td.append(input)
      input.addEventListener("change", ()=>self.updateView(self))
      newrow.append(td)
    }
    appendLabelElement(key, "treasure")
    appendLabelElement(key, "scroll")
    appendLabelElement(key, "kph")
    let gph = document.createElement("td")
    gph.innerText = 0
    gph.id = `${key}_gph`
    newrow.append(gph)
    self.fightTable.append(newrow)
  }
  updateView(self){
    // Lets loop through and complete each row
    for( const [zone, zoneDict] of Object.entries(self.data) ){
      if( typeof(self.places[zone]) === 'undefined' ){
        continue
      }
      let zoneMarket = 0
      for( const [monster, log] of Object.entries(zoneDict) ){
        let market = 0
        // Sortable :: Add
        // itemName.addEventListener('click', ()=>sortTable(table, 0))
        for( const [item, stats] of Object.entries(log.loot) ){
          //console.log(item, stats)
          let marketValue = self.itemdata[item]
          marketValue = (typeof(marketValue) === 'undefined')? 1 : marketValue
          let gpk = marketValue * (stats.count/log.kills)
          market += gpk
        }
        try{
          if( monster in zoneFrequency[zone] ){
            zoneMarket += market * zoneFrequency[zone][monster]
          }
        } catch(error) {};
      }
      // Now we need to collect from rowDictionary
      let th = document.getElementById(`${zone}_treasure`).value
      let scroll = document.getElementById(`${zone}_scroll`).value
      let kph = document.getElementById(`${zone}_kph`).value
      localStorage[`${zone}_treasure`] = th
      localStorage[`${zone}_scroll`] = scroll
      localStorage[`${zone}_kph`] = kph
      let gph = numberWithCommas((zoneMarket * kph * (1 + th*0.03 + scroll*0.03) * (1 + 0.1*scroll)).toFixed(0))
      document.getElementById(`${zone}_gph`).innerText = gph
    }
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
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
