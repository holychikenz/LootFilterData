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
    self.updateView(self)
    document.body.append(self.dom)
  }
  updateView(self){
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
    for( const [monster, log] of Object.entries(dtable) ){
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
      head.append(itemName)
      head.append(dropCount)
      head.append(dropFreq)
      table.append(head)
      for( const [item, stats] of Object.entries(log.loot) ){
        let row = document.createElement("tr")
        let name = document.createElement("td")
        name.innerText = item
        row.append(name)
        let total = document.createElement("td")
        row.append(total)
        //console.log(item, stats)
        total.innerText = (log.kills/stats).toFixed(2)
        let frequency = document.createElement("td")
        row.append(frequency)
        frequency.innerText = (stats/log.kills).toFixed(4)
        table.append(row)
        // Get market value
        let marketValue = self.itemdata[item]
        marketValue = (typeof(marketValue) === 'undefined')? 1 : marketValue
        console.log(item, marketValue)
        market += marketValue * (stats/log.kills)
      }
      newdiv.append(table)
      // Default sort
      sortTable(table, 1, "num")
      // Summary in header
      title.innerText = `${monster}: ${(log.kills).toFixed(0)} kills -> ${market.toFixed(0)} gp/kill`
    }
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
