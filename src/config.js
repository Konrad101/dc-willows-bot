
export { 
    RESERVE_ROLES, RAID_MANAGEMENT_ROLES, SIGN_TO_RAID_ROLES, RAIDS_PRIORITY_ROLES,
    WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU,
    MEMBERS_BATCH_SIZE, EMBEDDER_COLOR,
    DB_FILE_PATH
 };

// ----------------------------
//  Konfiguracja dostępu i ról. 

//  Role, które będą trafiać na rezerwę. 
const RESERVE_ROLES = [ "Warn" ];

//  Role do zarządzania rajdem:
//  - tworzenie rajdów
//  - edycja rajdów
//  - anulowanie rajdów
//  - wyrzucanie osób z rajdów
const RAID_MANAGEMENT_ROLES = [ "MaratończykPlus", "Admin" ]; 

// Role pozwalające się zapisać na rajd.
const SIGN_TO_RAID_ROLES = [ "maratończyk", "MaratończykPlus" ];

// Role pozwalające się zapisywać podczas priorytetu.
const RAIDS_PRIORITY_ROLES = [ "Famowicz" ];


// -------------------------------------------
//  Konfiguracja do listy z SP'kami do wyboru.
//  Ustawianie:
//  1. id Emoji 
//  2. nazwy Emoji
//  3. labelki (tekst, co się wyświetli przy ikonce)

const WARRIOR_SELECT_MENU = {
    placeholder: "SP wojownika",
    specialists: [
        { id: "1292183221584400617", name: "warsp1", label: "SP 1" },
        { id: "1136228232367198208", name: "warsp2", label: "SP 2" },
        { id: "1136228250234921010", name: "warsp3", label: "SP 3" },
        { id: "1136228263816085636", name: "warsp4", label: "SP 4" },
        { id: "1136244449710723092", name: "warsp5", label: "SP 5" },
        { id: "1136244462432038963", name: "warsp6", label: "SP 6" },
        { id: "1136244476243882025", name: "warsp7", label: "SP 7" },
        { id: "1136228324084031488", name: "warsp8", label: "SP 8" },
        { id: "1136244512218427423", name: "warsp9", label: "SP 9" },
        { id: "1155092148937564190", name: "warsp10", label: "SP 10" },
        { id: "1292183948163813479", name: "warsp11", label: "SP 11" },
    ]
};

const ARCHER_SELECT_MENU = {
    placeholder: "SP łucznika",
    specialists: [
        { id: "1136227772273012798", name: "archsp1", label: "SP 1" },
        { id: "1136227802954346578", name: "archsp2", label: "SP 2" },
        { id: "1136227818703958086", name: "archsp3", label: "SP 3" },
        { id: "1136227837574127726", name: "archsp4", label: "SP 4" },
        { id: "1136227855613820999", name: "archsp5", label: "SP 5" },
        { id: "1136244256110039050", name: "archsp6", label: "SP 6" },
        { id: "1136244201550532681", name: "archsp7", label: "SP 7" },
        { id: "1136244185406652416", name: "archsp8", label: "SP 8" },
        { id: "1136244171930341398", name: "archsp9", label: "SP 9" },
        { id: "1155090721552994384", name: "archsp10", label: "SP 10" },
        { id: "1292183951351353485", name: "archsp11", label: "SP 11" },
    ]
};

const MAGE_SELECT_MENU = {
    placeholder: "SP maga",
    specialists: [
        { id: "1136228004826206398", name: "magsp1", label: "SP 1" },
        { id: "1136228034203107368", name: "magsp2", label: "SP 2" },
        { id: "1136228048119799930", name: "magsp3", label: "SP 3" },
        { id: "1136244338263859201", name: "magsp4", label: "SP 4" },
        { id: "1136228075986755685", name: "magsp5", label: "SP 5" },
        { id: "1136244397357412432", name: "magsp6", label: "SP 6" },
        { id: "1136228107330789467", name: "magsp7", label: "SP 7" },
        { id: "1136228122224767006", name: "magsp8", label: "SP 8" },
        { id: "1136244417766903858", name: "magsp9", label: "SP 9" },
        { id: "1136244358396530709", name: "magsp10", label: "SP 10" },
        { id: "1292183920539996182", name: "magsp11", label: "SP 11" },
    ]
};

const MARTIAL_ARTIST_SELECT_MENU = {
    placeholder: "SP MSW",
    specialists: [
        { id: "1292188005796286487", name: "mswsp1", label: "SP 1" },
        { id: "1292188003556393041", name: "mswsp2", label: "SP 2" },
        { id: "1292188001262112859", name: "mswsp3", label: "SP 3" },
        { id: "1292187999744032830", name: "mswsp4", label: "SP 4" },
        { id: "1292187997957128315", name: "mswsp5", label: "SP 5" },
        { id: "1292187995989868646", name: "mswsp6", label: "SP 6" },
        { id: "1292187994085920768", name: "mswsp7", label: "SP 7" },
    ]
};


// ------------------------------------------------
// Konfiguracja embeddingu z listą zapisanych osób.

// Lista jest rozdzielana na kilka wierszy, bo jeden
// wiersz nie pomieści wszystkich graczy.
// Wartość poniżej definiuje ile maksymalnie graczy
// może zmieścić 1 wiersz.
const MEMBERS_BATCH_SIZE = 2;

// Kolor paska po lewej stronie embeddera w wartości heksadecymalnej.
const EMBEDDER_COLOR = 0x9400FF;


// ------------------------------------
// Konfiguracja bazy danych z zapisami.
// Albo ścieżka do pliku, 
// albo wpisać :memory:
// żeby trzymało rajdy w pamięci (po restarcie apki - nie będzie się dało nic edytować)
const DB_FILE_PATH = ":memory:";
