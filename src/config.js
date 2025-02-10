
export { 
    RESERVE_ROLES,
    WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU,
 };

// -------------------------------------
//  Role, które będą trafiać na rezerwę. 
const RESERVE_ROLES = [ "Warn" ];

// -------------------------------------------
//  Konfiguracja do listy z SP'kami do wyboru.
//  Ustawianie id Emoji i nazwy Emoji z discorda.

const WARRIOR_SELECT_MENU = {
    placeholder: "SP wojownika",
    specialists: [
        { id: "1292183221584400617", name: "warsp1" },
        { id: "1136228232367198208", name: "warsp2" },
        { id: "1136228250234921010", name: "warsp3" },
        { id: "1136228263816085636", name: "warsp4" },
        { id: "1136244449710723092", name: "warsp5" },
        { id: "1136244462432038963", name: "warsp6" },
        { id: "1136244476243882025", name: "warsp7" },
        { id: "1136228324084031488", name: "warsp8" },
        { id: "1136244512218427423", name: "warsp9" },
        { id: "1155092148937564190", name: "warsp10" },
        { id: "1292183948163813479", name: "warsp11" },
    ]
};

const ARCHER_SELECT_MENU = {
    placeholder: "SP łucznika",
    specialists: [
        { id: "1136227772273012798", name: "archsp1" },
        { id: "1136227802954346578", name: "archsp2" },
        { id: "1136227818703958086", name: "archsp3" },
        { id: "1136227837574127726", name: "archsp4" },
        { id: "1136227855613820999", name: "archsp5" },
        { id: "1136244256110039050", name: "archsp6" },
        { id: "1136244201550532681", name: "archsp7" },
        { id: "1136244185406652416", name: "archsp8" },
        { id: "1136244171930341398", name: "archsp9" },
        { id: "1155090721552994384", name: "archsp10" },
        { id: "1292183951351353485", name: "archsp11" },
    ]
};

const MAGE_SELECT_MENU = {
    placeholder: "SP maga",
    specialists: [
        { id: "1136228004826206398", name: "magsp1" },
        { id: "1136228034203107368", name: "magsp2" },
        { id: "1136228048119799930", name: "magsp3" },
        { id: "1136244338263859201", name: "magsp4" },
        { id: "1136228075986755685", name: "magsp5" },
        { id: "1136244397357412432", name: "magsp6" },
        { id: "1136228107330789467", name: "magsp7" },
        { id: "1136228122224767006", name: "magsp8" },
        { id: "1136244417766903858", name: "magsp9" },
        { id: "1136244358396530709", name: "magsp10" },
        { id: "1292183920539996182", name: "magsp11" },
    ]
};

const MARTIAL_ARTIST_SELECT_MENU = {
    placeholder: "SP MSW",
    specialists: [
        { id: "1292188005796286487", name: "mswsp1" },
        { id: "1292188003556393041", name: "mswsp2" },
        { id: "1292188001262112859", name: "mswsp3" },
        { id: "1292187999744032830", name: "mswsp4" },
        { id: "1292187997957128315", name: "mswsp5" },
        { id: "1292187995989868646", name: "mswsp6" },
        { id: "1292187994085920768", name: "mswsp7" },
    ]
};
