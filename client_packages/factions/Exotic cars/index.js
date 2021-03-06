const NativeUI = require("nativeui");
const Menu = NativeUI.Menu;
const UIMenuItem = NativeUI.UIMenuItem;
const UIMenuListItem = NativeUI.UIMenuListItem;
const UIMenuCheckboxItem = NativeUI.UIMenuCheckboxItem;
const UIMenuSliderItem = NativeUI.UIMenuSliderItem;
const BadgeStyle = NativeUI.BadgeStyle;
const Point = NativeUI.Point;
const ItemsCollection = NativeUI.ItemsCollection;
const Color = NativeUI.Color;
const ListItem = NativeUI.ListItem;
let selectedNumPlate = null;
player = mp.players.local;
const MenuPoint = new Point(50, 50);
let clothesjustiz = null;
let mainMenujustiz = null;
let memberMenujustiz = null;

// Main Menu
mp.events.add("client:ex:openMainMenu", (factionrang) => {
  mainMenujustiz = new Menu("Exotic cars","",MenuPoint);  
  mainMenujustiz.AddItem(new UIMenuItem("Rechnung ausstellen",""));
  if(factionrang > 1){
    mainMenujustiz.AddItem(new UIMenuItem("Mitarbeiterverwaltung",""));
  }
  mainMenujustiz.AddItem(new UIMenuItem("Schließen",""));
  if(mainMenujustiz.Visible == false && memberMenujustiz.Visible == false)
  {
  mainMenujustiz.Open();
  }
  mainMenujustiz.ItemSelect.on((item, index) => {
    if (item.Text !== "Rechnung ausstellen") {
      const nextMenu = index;    
      mp.events.callRemote("server:ex:mainMenu",nextMenu, item.Text);
      mainMenujustiz.Close();
    } else {
      mp.events.call("createInputShop", "exRechnung");
      mainMenujustiz.Close();
    }    
  });
  mainMenujustiz.MenuClose.on(() => {
    mp.events.callRemote("server:playermenu:variable");
  });
});
mp.events.add("client:ex:closeMainMenu", () => {
  mainMenujustiz.Close();
});

mp.events.add("sendInputrechnung",(trigger,output) => {
  if (rechnung !== null) {
    rechnung.destroy();
    rechnung = null;
  }
  mp.events.callRemote("inputValuerechnung", trigger, output);
  mp.gui.cursor.show(false, false);
  });
  mp.events.add("client:ex:requestrechnung", (cop, amount, accountamount, staatskonto) => {
    const   ui_ticket = new Menu("Rechnung bezahlen", "Du sollst "+amount+"$ bezahlen", MenuPoint);
            ui_ticket.AddItem( new UIMenuItem("Bezahlen", "Bezahle die Rechnung"));
            ui_ticket.AddItem( new UIMenuItem("Ablehnen", "Die Rechnung nicht bezahlen"));
            ui_ticket.Visible = true;
  
    ui_ticket.ItemSelect.on((item, index, value) => {
        if (item.Text == 'Bezahlen') {
            mp.events.callRemote("server:ex:payrechnung",cop,amount,accountamount, staatskonto);
            ui_ticket.Close();
        } else if (item.Text == 'Ablehnen') {
            mp.events.callRemote("server:ex:dontPayrechnung",cop);
            ui_ticket.Close();
        }
    });
  });

mp.events.add("client:ex:createChiefMenu",() => {
  let main = new Menu("Chef PC", "Chef Computer", MenuPoint);
    main.AddItem(new UIMenuItem("Mitarbeiter",""));   
    main.AddItem( new UIMenuItem("Schließen", ""));
    main.Visible = true;

    main.ItemSelect.on((item, index, value) => {
    if (item.Text == "Mitarbeiter") {
      mp.events.callRemote("server:ex:mitarbeiter");
      main.Close();
    } else if (item.Text == "Schließen") {
      main.Close();
    }
  });
  main.MenuClose.on(() => {
    mp.events.callRemote("server:playermenu:variable");
  });
});


mp.events.add("client:ex:createOfficeComputer", (factionrang) => {
  const officeComputer = new Menu("Exotic cars","Computer",MenuPoint);
 officeComputer.AddItem(new UIMenuItem("Leitstelle","Leitstelle übernehmen/abgeben Nummer: 564"));
 if (factionrang > 1) {
  officeComputer.AddItem(new UIMenuItem("Mitarbeiter","Mitarbeiter von Exotic cars"));
 } 
 officeComputer.Visible = true; 

 officeComputer.ItemSelect.on((item, index) => {
   if (item.Text == "Leitstelle") {
     mp.events.callRemote("server:phone:getLeitstelle",564);
     officeComputer.Close();      
   } else if (item.Text == "Mitarbeiter") {
     mp.events.callRemote("server:ex:mitarbeiter");
     officeComputer.Close();
   } 
 });
 officeComputer.MenuClose.on(() => {
  mp.events.callRemote("server:playermenu:variable");
});
 
});
mp.events.add("client:lsmc:openofficeComputer", () => {
  if(activeMemberMenu == null && officeComputer.Visible == false)
  officeComputer.Open();
});


//MemberMenu
mp.events.add("client:ex:openMemberMenu", () => {
  memberMenujustiz = new Menu("Exotic cars","Mitarbeiterverwaltung",MenuPoint);
  memberMenujustiz.AddItem(new UIMenuItem("Einstellen","Person einstellen"));
  memberMenujustiz.AddItem( new UIMenuListItem("Befördern","Befördere dein gegenüber", LSPDRanks =new ItemsCollection(["1", "2"])));
  memberMenujustiz.AddItem(new UIMenuItem("Entlassen","Person entlassen"));
  memberMenujustiz.Open();
  memberMenujustiz.ItemSelect.on((item, index) => {  
     if (item.Text == "Einstellen") {
      mp.events.callRemote("server:ex:einstellen");
      memberMenujustiz.Close();
     } else if (item.Text == "Entlassen") {
       mp.events.callRemote("server:ex:entlassen");
       memberMenujustiz.Close();
     } else if (item.Text == "Befördern") {
      mp.events.callRemote("server:ex:befördern",item.SelectedItem.DisplayText);
      memberMenujustiz.Close();
     }
  });
});
mp.events.add("client:ex:closeMemberMenu", () => {
memberMenujustiz.Close();
});

function drawMenu(charJSON){
  mp.gui.cursor.visible = false;
  // Menu für Fahrzeugliste anlegen
  ui_List = new Menu("Mitarbeiter", "Liste aller Mitarbeiter", MenuPoint);
  ui_List.Visible = true;
  if (charJSON != "none"){
    charList = JSON.parse(charJSON);
    charList.forEach(char => {
        let newItem = new UIMenuItem(""+char.firstname+" "+char.lastname, ""+char.id);
        ui_List.AddItem(newItem);
        newItem.SetRightLabel("Rang: "+char.factionrang);
    });
  } else{
    ui_List.AddItem(new UIMenuItem("Du besitzt keine Charaktere!", ""));
  }


  ui_List.ItemSelect.on((item, index) => {      
      mp.events.call("client:ex:memberSub",item.Description);
      ui_List.Close();
  });
}
mp.events.add("client:ex:Memberlist", drawMenu);

mp.events.add("client:ex:memberSub",(id) => {
  let memberSub = new Menu("Chef PC", "Chef Computer", MenuPoint);
  memberSub.AddItem(new UIMenuItem("Kündigen",""));   
  memberSub.AddItem( new UIMenuItem("Schließen", ""));
  memberSub.Visible = true;

    memberSub.ItemSelect.on((item, index, value) => {
    if (item.Text == "Kündigen") {
      mp.events.callRemote("server:ex:mitarbeiterentl",id);
      memberSub.Close();
    } else if (item.Text == "Schließen") {
      memberSub.Close();
    }
  });
});



