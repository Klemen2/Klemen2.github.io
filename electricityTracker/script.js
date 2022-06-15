"use strict";

var storage = {
    "defaultSaveFilename":"porabaElektrike",
    "defaultTariff":"VT",
    "defaultTariffPrices":{
        "VT":0.079,
        "MT":0.045,
        "ET":0.07
    },
    "selectedLocation":"",
    "tables": {
    }
};

const rowTemplate = (usage, price, tariff, date) => {
    let r = document.getElementById("row").innerHTML;
    return r.replace("$usage",usage).replace("$price",price).replace("$date",date).replace("$VT",(tariff == "VT") ? "selected" : "").replace("$MT",(tariff == "MT") ? "selected" : "").replace("$ET",(tariff == "ET") ? "selected" : "")
}


function localLoad() { storage = JSON.parse(localStorage.getItem("porabaElektrike")); }
function localSave() { localStorage.setItem("porabaElektrike",JSON.stringify(storage)) }
function getId() { return storage["selectedLocation"]; }
function setId(value) { storage["selectedLocation"] = value; } 
function reset(){
    storage = {
        "defaultSaveFilename":"porabaElektrike",
        "defaultTariff":"VT",
        "defaultTariffPrices":{
            "VT":0.079,
            "MT":0.045,
            "ET":0.07
        },
        "selectedLocation": "",
        "tables":{}
    }
    document.getElementById("tbody").remove();
    loadSettings()
    locationSelector.innerHTML = "";
}

var stats;
var tbody;

function load(id){
    if(!id) return;
    if(getId()) document.getElementById("loc_"+getId()).classList.remove("selectedBtn")
    document.getElementById("loc_"+id).classList.add("selectedBtn")
    setId(id)
    if(tbody) tbody.remove()
    tbody = document.createElement("tbody")
    let t = storage["tables"][id];
    tbody.setAttribute("id", "tbody");
    table.appendChild(tbody)

    t.forEach( (element,i) => {
        createRow(element)
    });
    calculateStats()
    localSave()
}

function calculateStats(){
    if(!getId() || storage["tables"][getId()].length==0){
        stat[0].innerHTML = 0;
        stat[1].innerHTML = 0;
        stat[2].innerHTML = 0;
        stat[3].innerHTML = 0;
        stat[4].innerHTML = "Tabela še ne obstaja";
        stat[5].innerHTML = "Tabela še ne obstaja";
        stat[6].innerHTML = "Tabela še ne obstaja";
        stat[7].innerHTML = "Tabela še ne obstaja";
        stat[8].innerHTML = 0;
        return;
    }

    let t = storage["tables"][getId()];
    let rows = t.length;

    stats = {
        "price":0,
        "min_price": 0,
        "max_price": 0,
        "usage":0,
        "min_usage": 0,
        "max_usage": 0,
        "max_date": new Date(t[0][3]),
        "min_date": new Date(t[0][3])
    }

    
    t.forEach( (element,i) => {
        stats["price"] += element[0]*element[1];
        stats["usage"] += element[0];
        if(t[stats["min_price"]][1]> element[1] ) stats["min_price"] = i;
        if(t[stats["min_usage"]][0]> element[0] ) stats["min_usage"] = i;
        if(t[stats["max_price"]][1]< element[1] ) stats["max_price"] = i;
        if(t[stats["max_usage"]][0]< element[0] ) stats["max_usage"] = i;
        const temp = new Date(element[3]);
        if(stats["max_date"]<temp) stats["max_date"] = temp;
        else if(stats["min_date"]>temp) stats["min_date"] = temp;

    });

    const temp = ((stats["max_date"]-stats["min_date"])/ (1000 * 60 * 60 * 24))+1;

    stat[0].innerHTML = Math.round(stats["usage"]*100/temp)/100;
    stat[1].innerHTML = Math.round(stats["price"]*10000/temp)/10000;
    
    stat[2].innerHTML = Math.round(stats["usage"]*100)/100;
    stat[3].innerHTML = Math.round(stats["price"]*10000)/10000;
    stat[4].innerHTML = formatStats(t[stats["min_usage"]], true);
    stat[5].innerHTML = formatStats(t[stats["min_price"]]);
    stat[6].innerHTML = formatStats(t[stats["max_usage"]], true);
    stat[7].innerHTML = formatStats(t[stats["max_price"]]);
    stat[8].innerHTML = temp;
}

function formatStats(val, kvh){
    let t = "";
    switch(val[2]){
        case "VT":
            t = getLangValue("high");
            break;
        case "MT":
            t = getLangValue("low");
            break;
        case "ET":
            t = getLangValue("unified");
            break
    }
    
    return ((kvh) ? val[0]+" kWh | " : "") +val[1]+" €/kWh | "+t+" | "+new Date(val[3]).toLocaleDateString();
}

function removeRow(e){
    let row = e.target.parentNode.parentNode.rowIndex;
    table.deleteRow(row);
    storage["tables"][getId()].splice(row-1,1);
    localSave()
}

function addRow(){
    let currentDate = new Date();
    createRow(null, 0, storage["defaultTariffPrices"][storage["defaultTariff"]],storage["defaultTariff"],currentDate.toISOString().slice(0, 10))
}

function switchPos(e){
    let row = e.target.parentNode.parentNode.rowIndex-1;
    if(e.target.value == "up" && row>0){
        let temp = storage["tables"][getId()][row-1];
        storage["tables"][getId()][row-1] = storage["tables"][getId()][row];
        storage["tables"][getId()][row] = temp;
        tbody.insertBefore(e.target.parentNode.parentNode, e.target.parentNode.parentNode.previousElementSibling);

    }else if(row<storage["tables"][getId()].length-1) {
        let temp = storage["tables"][getId()][row+1];
        storage["tables"][getId()][row+1] = storage["tables"][getId()][row];
        storage["tables"][getId()][row] = temp;
        tbody.insertBefore(e.target.parentNode.parentNode.nextElementSibling, e.target.parentNode.parentNode);
    }
    localSave();
}

function createRow(arr, ...data){
    if(Object.keys(storage["tables"]).length == 0) {
        consoleHTML(getLangValue("noLocation"),"w");
        return;
    }else if(!getId()){
        consoleHTML(getLangValue("noSelection"),"w");
        return;
    }
    const row = document.createElement("tr");
    if(arr) row.innerHTML = rowTemplate(...arr);
    else {
        row.innerHTML = rowTemplate(...data);
        storage["tables"][ getId()].push([0,storage["defaultTariffPrices"][storage["defaultTariff"]],storage["defaultTariff"],row.children[3].children[0].value]);
    }
    
    row.addEventListener("change",changeValues);
    const td = document.createElement("td");
    td.classList.add("inrow")
    let btn = document.createElement("button");
    btn.textContent = "↑";
    btn.value = "up"
    btn.classList.add("moveBtn")
    btn.addEventListener("click", switchPos)
    td.appendChild(btn);
    btn = document.createElement("button");
    btn.textContent = "↓";
    btn.classList.add("moveBtn")
    btn.addEventListener("click", switchPos)
    td.appendChild(btn);
    btn = document.createElement("button");
    btn.textContent = "×";
    btn.classList.add("removeBtn")
    if(!deleteBtns)btn.style.display = "none"
    btn.addEventListener("click", removeRow)
    td.appendChild(btn);
    row.appendChild( td );
    tbody.appendChild(row);
    localSave();
}

function changeValues(e){
    let row = e.target.parentNode.parentNode
    let rowIndex = row.rowIndex-1;
    storage["tables"][ getId()][rowIndex][e.target.parentNode.cellIndex] = (e.target.type == "number") ? parseFloat(e.target.value) : e.target.value;
    calculateStats()
    localSave();
}

function loadFile(file){
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            var temp = JSON.parse(evt.target.result);
            if(!temp["defaultSaveFilename"]) temp["defaultSaveFilename"] = "porabaElektrike";
            if(!temp["defaultTariff"]) temp["defaultTariff"] = "VT";
            if(!temp["defaultTariffPrices"]) temp["defaultTariffPrices"] = {};
            if(!temp["defaultTariffPrices"]["VT"]) temp["defaultTariffPrices"]["VT"] = 0.079;
            if(!temp["defaultTariffPrices"]["MT"]) temp["defaultTariffPrices"]["MT"] = 0.045;
            if(!temp["defaultTariffPrices"]["ET"]) temp["defaultTariffPrices"]["ET"] = 0.07;
            if(!temp["selectedLocation"]) temp["selectedLocation"] = null;
            if(!temp["tables"]) temp["tables"] = {};
            storage = temp;

            locationSelector.innerHTML = "";
            if(tbody) tbody.remove();
            stat.forEach(e => e.innerHTML = "0");

            loadSettings();
            generateLocationOptions();
            load(getId());
            consoleHTML(getLangValue("uploadSuccess")+": "+file.name)
        }
        reader.onerror = function (evt) {
            consoleHTML(getLangValue("uploadError"),"e")
        }
    }
}

function save(){
    var file = new Blob([JSON.stringify(storage)], {type: 'text/plain'});
    var filename = storage["defaultSaveFilename"]+".json";
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
         url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
    consoleHTML(getLangValue("saveSuccess")+": "+filename)
}

var consoleCount = 0;

function consoleHTML(text, type){
    const div = document.createElement("div")
    switch(type){
        case "e":
            div.classList = "error"
            break;
        case "w":
            div.classList = "warning"
            break;
        default:
            div.classList = "success"
            break;
    }
    div.classList.add("border")
    const id = consoleCount;
    div.id = "console_"+consoleCount;
    div.innerHTML = text;
    htmlConsole.appendChild(div);
    setTimeout(function(){
        document.getElementById("console_"+id).remove()
        consoleCount--;
    }, 3000);
    consoleCount++;
}

function removeLocation(e){
    if(e.target.value == getId()){
        tbody.remove();
        setId(null);
        calculateStats();
    }
    delete storage["tables"][e.target.value];
    e.target.parentNode.remove();
    consoleHTML(getLangValue("deletedLocation")+": "+e.target.value)
    localSave();
}

function createLocation(loc){
    const btn = document.createElement("button");
            btn.value = loc;
            btn.id = "loc_"+loc;
            btn.innerHTML = loc;
            btn.addEventListener("click", e => { load(e.target.value) })
    const del = document.createElement("button");
            del.textContent = "×";
            del.value = loc;
            del.classList.add("removeBtn");
            if(!deleteBtns) del.style.display = "none";
            del.addEventListener("click", removeLocation);
    const bar = document.createElement("span");
    bar.classList.add("bar")
    const li = document.createElement("li")
        li.appendChild(btn)
        li.appendChild(del)
        li.appendChild(bar)
    locationSelector.appendChild(li);
}
   
function generateLocationOptions(){
    Object.keys(storage["tables"]).forEach(e => {
        createLocation(e);
    });
}

function addLoaction(){
    const v = inputAddLocation.value.trim()
    if(!v) consoleHTML(getLangValue("emptyInput"),"w");
    else if(storage["tables"][v]) consoleHTML(getLangValue("existsLocation"),"w");
    else {
        inputAddLocation.value = "";
        if(Object.keys(storage["tables"]).length == 0) storage["selectedLocation"] = v;
        storage["tables"][v] = [];
        createLocation(v);
        consoleHTML(getLangValue("addedLocaion")+": "+v)
        load(v)
    }
}

function styleChange(color){
    if(color == "black"){
        rootstyle.style.setProperty('--color', 'white');
        rootstyle.style.setProperty('--bg-color', '#464646');
        rootstyle.style.setProperty('--bg-color2', '#505050');
        rootstyle.style.setProperty('--bg-color3', '#50505077');
        rootstyle.style.setProperty('--border-color','#e0e0e0d0')
        rootstyle.style.setProperty('--border-bg', '#505050');
        return "black";
    }
    rootstyle.style.setProperty('--color', 'black');
    rootstyle.style.setProperty('--bg-color', '#f3f3f3');
    rootstyle.style.setProperty('--bg-color2', '#ffffff');
    rootstyle.style.setProperty('--bg-color3', '#ffffff77');
    rootstyle.style.setProperty('--border-color', '#a8e7e9d0');
    rootstyle.style.setProperty('--border-bg', '#ffffff');
    return "white";
    
}

function toggleDarkMode(){
    localStorage.setItem("color", styleChange(getComputedStyle(rootstyle).getPropertyValue("--color")));
}

function changeSettings(e){
    switch(e.target.name){
        case "defaultTariffPricesMT":
            storage["defaultTariffPrices"]["MT"] = parseFloat(e.target.value);
            break; 
        case "defaultTariffPricesET":
            storage["defaultTariffPrices"]["ET"] = parseFloat(e.target.value);
            break; 
        case "defaultTariffPricesVT":
            storage["defaultTariffPrices"]["VT"] = parseFloat(e.target.value);
            break; 
        default:
            storage[e.target.name] = e.target.value;
            break;
    }
    localSave()
}

function loadSettings(){
    let temp = document.getElementById("fileName");
    temp.value = storage[temp.name];
    temp.addEventListener("change",changeSettings);

    temp = document.getElementById("defTariff");
    temp.value = storage[temp.name];
    temp.addEventListener("change",changeSettings);
    
    temp = document.getElementById("defTariffV");
    temp.value = storage["defaultTariffPrices"]["VT"];
    temp.addEventListener("change",changeSettings);

    temp = document.getElementById("defTariffM");
    temp.value = storage["defaultTariffPrices"]["MT"];
    temp.addEventListener("change",changeSettings);

    temp = document.getElementById("defTariffE");
    temp.value = storage["defaultTariffPrices"]["ET"];
    temp.addEventListener("change",changeSettings);
}

function deleteToggleOnClick(e){
    deleteToggle(e.target.checked);
}

function deleteToggle(value){
    deleteBtns = value;
    localStorage.setItem("deleteToggles", (value) ? "": "off");
    let btns = document.getElementsByClassName("removeBtn");
    if(value) for(let i = 0; i < btns.length; i++) btns[i].style.display = "inline"; 
    else for(let i = 0; i < btns.length; i++) btns[i].style.display = "none";
}

var deleteBtns = true;

var rootstyle;
var table;
var graph;
var inputAddLocation;
var inputLoad;
var htmlConsole;
var locationSelector;
var dark;
var drop;
var dropContainer;
const stat = []

document.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem("porabaElektrike")) localLoad();
    if(localStorage.getItem("deleteToggles") == "off") document.getElementById("deleteToggle").checked = false;

    graph = document.getElementById("graph")
    table = document.getElementById("table");
    inputAddLocation = document.getElementById("inputAddLocation");
    inputLoad = document.getElementById("inputLoad");
    htmlConsole = document.getElementById("htmlConsole");
    locationSelector = document.getElementById("locationSelector");
    rootstyle = document.querySelector(':root');
    dark = document.getElementById("dark");
    drop = document.getElementById("drop");
    dropContainer = document.getElementById("dropContainer")
    
    if(localStorage.getItem("color")){
        styleChange(localStorage.getItem("color"));
        if(localStorage.getItem("color") == "black") dark.checked = true;
    }else styleChange('white');

    ["avg_usage","avg_price","usage","price","min_usage","min_price","max_usage","max_price","days"].forEach( i=>{
        stat.push(document.getElementById("stat_"+i));
    });


    dark.addEventListener("click", toggleDarkMode);
    document.getElementById("btnAddRow").addEventListener("click", addRow);
    document.getElementById("btnSave").addEventListener("click", save);
    document.getElementById("btnAddLocation").addEventListener("click",addLoaction);
    document.getElementById("btnNew").addEventListener("click", reset); 
    document.getElementById("deleteToggle").addEventListener("click",deleteToggleOnClick)

    loadSettings()

    document.getElementById("btnLoad").addEventListener("click", (_) => { inputLoad.click(); });
    document.getElementById("inputLoad").addEventListener("change", (event) => {loadFile(event.target.files[0]) });
    document.addEventListener("dragenter", (_) => {dropContainer.style.display = "flex";});
    drop.addEventListener("dragleave", (_) => { dropContainer.style.display = "none";});
    drop.addEventListener("drop", (event)=>{
        dropContainer.style.display = "none";
        loadFile(event.dataTransfer.files[0]);
    });

    window.addEventListener("drop",function(event){ event.preventDefault();  });
    window.addEventListener("dragover",function(event){event.preventDefault(); });
    
    generateLocationOptions();
    load(getId())
    deleteToggle(document.getElementById("deleteToggle").checked)
});