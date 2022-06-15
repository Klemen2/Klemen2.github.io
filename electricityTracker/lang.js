var language = {
    "en" : {
        "dropfile":"Drop file",
        "title": "Electricity tracker",
        "tables": "Tabels",
        "settings": "Settings",
        "deletebtns": "Delete buttons",
        "darkmode": "Dark mode",
        "filename": "File name",
        "tarif": "Tariff",
        "high": "High Tariff",
        "low": "Low Tariff",
        "unified": "Unified Tariff",
        "high_s": "High (HT)",
        "low_s": "Low (LT)",
        "unified_s": "Unified (UT)",
        "high_t": "HT",
        "low_t": "LT",
        "unified_t": "UT",
        "usage": "Usage",
        "price": "Price",
        "date": "Date",
        "statistic":"Statistics",
        "numberofdays":"Number of days",
        "usageperday":"Average usage per day",
        "priceperday":"Average price per day",
        "totalusage":"Total usage",
        "totalprice":"Total price",
        "minusage":"Minimum usage",
        "maxusage":"Maximum usage",
        "minprice":"Minimum price",
        "maxprice":"Maximum price",
        "tabledoesnotexist":"Table doesn't exist yet",
        "save":"Save",
        "upload":"Load",
        "new":"New",
        "info":"Data get saved automatically in browser local storage.",
        "uploadSuccess":"Uploaded file successfuly",
        "uploadError":"Error in reading the file",
        "noLocation":"No table has been added yet",
        "noSelection":"No selected table",
        "saveSuccess":"Saving sucessful",
        "deletedLocation":"Deleted table",
        "emptyInput":"Empty input",
        "addedLocaion":"Added new table",
        "existsLocation":"Table allready exists"
    },
    "sl" : {
        "dropfile":"Spusti datoteko",
        "title": "Vodenje porabe električne energije",
        "tables": "Tabele",
        "settings": "Nastavitve",
        "deletebtns": "Gumbi za odstranitev",
        "darkmode": "Temni način",
        "filename": "Ime datoteke",
        "tarif": "Tarifa",
        "high": "Visoka tarifa",
        "low": "Nizka tarifa",
        "unified": "Enotna tarifa",
        "high_s": "Visoka (VT)",
        "low_s": "Nizka (MT)",
        "unified_s": "Enotna (ET)",
        "high_t": "VT",
        "low_t": "MT",
        "unified_t": "ET",
        "usage": "Poraba",
        "price": "Cena",
        "date": "Datum",
        "statistic":"Statistika",
        "numberofdays":"Število dni",
        "usageperday":"Povprečna poraba na dan",
        "priceperday":"Povprečna cena na dan",
        "totalusage":"Skupna poraba",
        "totalprice":"Skupna cena",
        "minusage":"Najmanjša poraba",
        "maxusage":"Največja poraba",
        "minprice":"Najmanjša cena",
        "maxprice":"Največja cena",
        "tabledoesnotexist":"Tabela še ne obstaja",
        "save":"Shrani",
        "upload":"Naloži",
        "new":"Novo",
        "info":"Podatki se shanjujejo sproti v lokalno shrambo brskalnika.",
        "uploadSuccess":"Uspešno naložena datoteka",
        "uploadError":"Problem pri branju datoteke",
        "noLocation":"Dodana še ni bila nobena tabela",
        "noSelection":"Izbrana ni nobena tabela",
        "saveSuccess":"Uspešno shranjenje datoteke",
        "deletedLocation":"Odstranjena tabele",
        "emptyInput":"Prazen vnos",
        "addedLocaion":"Dodana nova tabela",
        "existsLocation":"Tabela že obstaja"
    }
}

function getLangValue(key){
    if(key in language[locale]) return language[locale][key];
    else return "missing_"+key;
}

let locale = navigator.language;
if(!(locale in language)) locale = "en";
if(localStorage.getItem("lang")) locale = localStorage.getItem("lang");

function changeLocale(e){
    locale = e.target.value;
    localStorage.setItem("lang", locale);
    changeLanguage()
}

function changeLanguage(){
    for (const [key, value] of Object.entries(language[locale])) {
        const x = document.getElementsByClassName("txt_"+key);
        for(let i = 0; i<x.length; i++){
            x[i].innerHTML = value;
        }
      }


}

document.addEventListener("DOMContentLoaded", () => { 
    let lang = document.getElementById("language");
    lang.value = locale;
    lang.addEventListener("change", changeLocale)
    changeLanguage();

})