/* Predate question bank: history, and everyday knowledge.
 *
 * Most rolls are history: emperors, battles, inventions. The rest are the things
 * people grew up with (games, phones, films, records, football, sweets), marked
 * by TOPIC so that the daily wall can mix the two.
 *
 * Every question is a roll of names. The player may give any name on the roll,
 * and each name carries a date. The older the answer, the harder it hits:
 * 3 damage, 2 damage or 1 damage, set per question by two cut-off years.
 *
 *   L(id, tier, question, datedBy, [cut3, cut2], roll, 'P'?)
 *     a year <= cut3 deals 3 damage, a year <= cut2 deals 2, anything later 1.
 *     tier: 1 = most players can name several, 2 = takes thought, 3 = hard
 *     (tier 3 only turns up deep in the endless march).
 *     'P' marks a roll of people: surnames are then accepted by themselves.
 *
 *   Each line of a roll is  Name|year|other spellings;separated;like this
 *     negative years are BC, "~" marks an approximate year, and a decimal
 *     orders events inside one year.
 *
 *   M(id, roll) adds more lines to a roll; the long tail of names lives further
 *   down the file that way, so the main rolls stay readable.
 *
 *   The oldest name on a roll matters most: giving it (or one within a hair of
 *   it, see KILL_RANGE in daily.js) fells any foe outright. So the oldest line
 *   of every roll must really be the oldest answer there is.
 *
 *   V(id, base, tier, question, [cut3, cut2], from, to, pattern?)
 *     a narrower question drawn from a roll above (a "variant"). Names outside
 *     from..to are recognised but refused.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var LISTS = [], VARIANTS = [];
  var TOPIC = 'history'; // what the rolls being declared are about: 'history' or 'everyday'
  function L(id, tier, q, by, cut, roll, flag) { LISTS.push({ id: id, tier: tier, q: q, by: by, cut: cut, roll: roll, people: flag === 'P', topic: TOPIC }); }
  function V(id, base, tier, q, cut, from, to, pattern) { VARIANTS.push({ id: id, base: base, tier: tier, q: q, cut: cut, from: from, to: to, pattern: pattern || null }); }

  // ======================= tier 1 =======================

  L('roman-emperors', 1, 'Name a Roman emperor.', 'start of reign', [68, 192], `
Augustus|-27|Octavian;Caesar Augustus;Octavius
Tiberius|14
Caligula|37|Gaius
Claudius|41
Nero|54
Galba|68
Otho|69
Vitellius|69
Vespasian|69
Titus|79
Domitian|81
Nerva|96
Trajan|98
Hadrian|117
Antoninus Pius|138|Antoninus
Marcus Aurelius|161|Aurelius
Lucius Verus|161|Verus
Commodus|180
Pertinax|193
Didius Julianus|193
Septimius Severus|193|Severus
Caracalla|211
Geta|211
Macrinus|217
Elagabalus|218|Heliogabalus
Severus Alexander|222|Alexander Severus
Maximinus Thrax|235|Maximinus
Gordian I|238
Gordian II|238
Pupienus|238
Balbinus|238
Gordian III|238
Philip the Arab|244|Philip
Decius|249
Trebonianus Gallus|251|Gallus
Aemilian|253|Aemilianus
Valerian|253
Gallienus|253
Claudius Gothicus|268|Claudius II
Aurelian|270
Tacitus|275
Probus|276
Carus|282
Carinus|283
Numerian|283
Diocletian|284
Maximian|286
Constantius Chlorus|305|Constantius I
Galerius|305
Maxentius|306
Constantine the Great|306|Constantine;Constantine I
Licinius|308
Constantine II|337
Constantius II|337
Constans|337
Julian|361|Julian the Apostate
Jovian|363
Valentinian I|364
Valens|364
Gratian|375
Valentinian II|375
Theodosius I|379|Theodosius the Great;Theodosius
Arcadius|395
Honorius|395
Valentinian III|425
Majorian|457
Romulus Augustulus|475|Romulus Augustus`);

  L('eng-monarchs', 1, 'Name a king or queen of England or Britain.', 'start of reign', [1065.99, 1484], `
Alfred the Great|871|Alfred
Edward the Elder|899
Athelstan|924|Aethelstan;Æthelstan
Edmund I|939
Eadred|946|Edred
Eadwig|955|Edwy
Edgar the Peaceful|959|Edgar
Edward the Martyr|975
Ethelred the Unready|978|Aethelred the Unready;Æthelred the Unready;Ethelred;Aethelred;Ethelred II
Sweyn Forkbeard|1013|Sweyn;Svein Forkbeard
Edmund Ironside|1016|Edmund II
Cnut|1016.5|Canute;Knut;Cnut the Great;Canute the Great
Harold Harefoot|1035|Harold I
Harthacnut|1040|Hardicanute;Harthacanute
Edward the Confessor|1042
Harold Godwinson|1066|Harold II;Harold
William the Conqueror|1066.9|William I
William II|1087|William Rufus
Henry I|1100
Stephen|1135
Henry II|1154
Richard the Lionheart|1189|Richard I
John|1199
Henry III|1216
Edward I|1272|Edward Longshanks;Longshanks
Edward II|1307
Edward III|1327
Richard II|1377
Henry IV|1399
Henry V|1413
Henry VI|1422
Edward IV|1461
Edward V|1483
Richard III|1483.5
Henry VII|1485
Henry VIII|1509
Edward VI|1547
Lady Jane Grey|1553|Jane
Mary I|1553.5|Mary Tudor;Bloody Mary
Elizabeth I|1558
James I|1603|James VI
Charles I|1625
Charles II|1660
James II|1685
William III|1689|William of Orange
Mary II|1689
Anne|1702
George I|1714
George II|1727
George III|1760
George IV|1820
William IV|1830
Victoria|1837
Edward VII|1901
George V|1910
Edward VIII|1936
George VI|1936.9
Elizabeth II|1952
Charles III|2022`);

  L('us-presidents', 1, 'Name a president of the United States.', 'start of term', [1825, 1897], `
George Washington|1789
John Adams|1797
Thomas Jefferson|1801
James Madison|1809
James Monroe|1817
John Quincy Adams|1825|JQ Adams;Quincy Adams
Andrew Jackson|1829
Martin Van Buren|1837|Van Buren
William Henry Harrison|1841
John Tyler|1841.3
James K. Polk|1845
Zachary Taylor|1849
Millard Fillmore|1850
Franklin Pierce|1853
James Buchanan|1857
Abraham Lincoln|1861|Abe Lincoln;Honest Abe
Andrew Johnson|1865
Ulysses S. Grant|1869|US Grant
Rutherford B. Hayes|1877
James A. Garfield|1881
Chester A. Arthur|1881.7
Grover Cleveland|1885
Benjamin Harrison|1889
William McKinley|1897
Theodore Roosevelt|1901|Teddy Roosevelt;Teddy
William Howard Taft|1909
Woodrow Wilson|1913
Warren G. Harding|1921
Calvin Coolidge|1923
Herbert Hoover|1929
Franklin D. Roosevelt|1933|FDR;Franklin Delano Roosevelt
Harry S. Truman|1945
Dwight D. Eisenhower|1953|Ike
John F. Kennedy|1961|JFK;Jack Kennedy
Lyndon B. Johnson|1963|LBJ
Richard Nixon|1969
Gerald Ford|1974
Jimmy Carter|1977|James Carter
Ronald Reagan|1981
George H. W. Bush|1989|Bush Sr;Bush Senior;George Bush Sr;George Bush Senior;Bush 41;HW Bush;George Herbert Walker Bush
Bill Clinton|1993|William Clinton
George W. Bush|2001|Bush Jr;Bush Junior;George Bush Jr;George Bush Junior;Bush 43;W Bush;Dubya;George Walker Bush
Barack Obama|2009
Donald Trump|2017
Joe Biden|2021|Joseph Biden`, 'P');

  L('wars', 1, 'Name a war.', 'when it began', [1499, 1899], `
Trojan War|~-1200|Troy
Greco-Persian Wars|-499|Persian Wars;Persian War;Greco-Persian War
Peloponnesian War|-431
Punic Wars|-264|Punic War;First Punic War
Second Punic War|-218|Hannibalic War
Third Punic War|-149
Gallic Wars|-58|Gallic War
Crusades|1096|First Crusade;The Crusades
Mongol conquests|1206|Mongol invasions;Mongol invasion
Wars of Scottish Independence|1296|Scottish Wars of Independence;Scottish War of Independence;Scottish Independence
Hundred Years' War|1337|100 Years War
Wars of the Roses|1455|War of the Roses
Italian Wars|1494
Eighty Years' War|1568|80 Years War;Dutch Revolt;Dutch War of Independence
Anglo-Spanish War|1585
Thirty Years' War|1618
English Civil War|1642|English Civil Wars;Civil War
Anglo-Dutch Wars|1652|Anglo-Dutch War
Nine Years' War|1688|War of the Grand Alliance
Great Northern War|1700
War of the Spanish Succession|1701|Spanish Succession
War of Jenkins' Ear|1739|Jenkins Ear
War of the Austrian Succession|1740|Austrian Succession
Seven Years' War|1756|French and Indian War
American Revolutionary War|1775|American War of Independence;American Revolution;Revolutionary War;War of Independence
French Revolutionary Wars|1792
Napoleonic Wars|1803|Napoleonic War
War of 1812|1812
Greek War of Independence|1821
Opium Wars|1839|Opium War;First Opium War
Mexican-American War|1846|Mexican War
Taiping Rebellion|1850|Taiping Civil War;Taiping
Crimean War|1853|Crimea
American Civil War|1861|US Civil War;Civil War
Austro-Prussian War|1866|Seven Weeks War
Franco-Prussian War|1870
Anglo-Zulu War|1879|Zulu War
First Sino-Japanese War|1894|Sino-Japanese War
Spanish-American War|1898
Boer War|1899|Second Boer War;Anglo-Boer War;South African War;Boer Wars
Boxer Rebellion|1899.9|Boxer Uprising;Boxer
Russo-Japanese War|1904
Balkan Wars|1912|Balkan War
World War I|1914|First World War;WWI;WW1;Great War;World War One
Russian Civil War|1917|Civil War
Irish War of Independence|1919
Chinese Civil War|1927|Civil War
Spanish Civil War|1936|Civil War
Second Sino-Japanese War|1937
World War II|1939|Second World War;WWII;WW2;World War Two
Winter War|1939.9
Cold War|1947
Arab-Israeli War|1948|1948 Arab-Israeli War;First Arab-Israeli War;Israeli War of Independence
Korean War|1950|Korea
Algerian War|1954|Algerian War of Independence
Vietnam War|1955
Six-Day War|1967
Yom Kippur War|1973
Soviet-Afghan War|1979|Soviet war in Afghanistan
Iran-Iraq War|1980
Falklands War|1982|Falklands Conflict
Gulf War|1990|First Gulf War;Persian Gulf War;Desert Storm
Bosnian War|1992|Bosnia
Kosovo War|1998
War in Afghanistan|2001|Afghanistan War;Afghan War
Iraq War|2003|Second Gulf War
Syrian civil war|2011|Syria;Civil War
Russo-Ukrainian War|2014|Ukraine War;War in Ukraine;Russia-Ukraine War;Ukraine`);

  L('battles', 1, 'Name a famous battle.', 'when it was fought', [999, 1799], `
Kadesh|~-1274
Marathon|-490
Thermopylae|-480
Salamis|-480.1
Plataea|-479
Issus|-333
Gaugamela|-331|Arbela
Cannae|-216
Zama|-202
Alesia|-52
Pharsalus|-48
Philippi|-42
Actium|-31
Teutoburg Forest|9|Teutoburg;Teutoburger Wald
Milvian Bridge|312
Adrianople|378
Catalaunian Plains|451|Chalons
Tours|732|Tours-Poitiers
Edington|878
Maldon|991
Clontarf|1014
Stamford Bridge|1066
Hastings|1066.8
Manzikert|1071
Hattin|1187
Bouvines|1214
Stirling Bridge|1297
Bannockburn|1314
Crécy|1346
Poitiers|1356
Agincourt|1415
Orléans|1429|Siege of Orleans
Constantinople|1453|Fall of Constantinople;Siege of Constantinople
Towton|1461
Bosworth|1485|Bosworth Field
Flodden|1513
Pavia|1525
Mohács|1526
Lepanto|1571
Spanish Armada|1588|Armada;Gravelines
Sekigahara|1600
Marston Moor|1644
Naseby|1645
Vienna|1683|Siege of Vienna
The Boyne|1690
Blenheim|1704
Poltava|1709
Culloden|1746
Plassey|1757
Quebec|1759|Plains of Abraham
Lexington and Concord|1775|Lexington;Concord
Bunker Hill|1775.5
Saratoga|1777
Yorktown|1781|Siege of Yorktown
The Nile|1798|Aboukir Bay
Trafalgar|1805
Austerlitz|1805.9
Borodino|1812
Leipzig|1813
New Orleans|1815
Waterloo|1815.5
The Alamo|1836
Balaclava|1854|Balaklava;Charge of the Light Brigade
Bull Run|1861|Manassas;First Bull Run
Antietam|1862|Sharpsburg
Gettysburg|1863
Sedan|1870
Little Bighorn|1876|Little Big Horn;Custer's Last Stand
Isandlwana|1879
Rorke's Drift|1879.1
Omdurman|1898
Tsushima|1905
The Marne|1914
Ypres|1914.8
Gallipoli|1915
Verdun|1916
Jutland|1916.4
The Somme|1916.5
Passchendaele|1917
Dunkirk|1940|Dunkerque
Britain|1940.5|Battle of Britain
Pearl Harbor|1941
Midway|1942
El Alamein|1942.8|Alamein
Stalingrad|1942.6
Kursk|1943
Normandy|1944|D-Day;DDay;Normandy landings
The Bulge|1944.9|Ardennes
Iwo Jima|1945
Okinawa|1945.2
Berlin|1945.3
Inchon|1950
Dien Bien Phu|1954`);

  L('empires', 1, 'Name an empire.', 'founding', [-500, 999], `
Akkadian Empire|~-2334|Akkad
Babylonian Empire|~-1894|Babylon;Old Babylonian
Hittite Empire|~-1600|Hittites
Egyptian Empire|~-1550|Egypt;New Kingdom;Ancient Egypt
Assyrian Empire|~-911|Assyria;Neo-Assyrian
Median Empire|~-678|Medes;Media
Carthaginian Empire|~-650|Carthage
Neo-Babylonian Empire|-626|Chaldean
Persian Empire|-550|Persia;Achaemenid;Achaemenid Empire
Athenian Empire|-478|Athens;Delian League
Macedonian Empire|-336|Macedon;Macedonia;Alexander's empire
Maurya Empire|-322|Mauryan
Seleucid Empire|-312|Seleucids
Parthian Empire|-247|Parthia
Han Empire|-202|Han dynasty;Han China
Roman Empire|-27|Rome
Kushan Empire|30
Aksumite Empire|~100|Aksum;Axum;Kingdom of Aksum
Sasanian Empire|224|Sassanid;Sassanian;Sassanid Empire
Gupta Empire|~320
Byzantine Empire|330|Byzantium;Eastern Roman Empire
Hunnic Empire|~370|Huns
Tibetan Empire|618|Tibet
Srivijaya|~650|Srivijaya Empire
Umayyad Caliphate|661|Umayyad;Umayyads;Umayyad Empire
Bulgarian Empire|681|Bulgaria;First Bulgarian Empire
Ghana Empire|~700|Ghana;Wagadou
Abbasid Caliphate|750|Abbasid;Abbasids;Abbasid Empire
Carolingian Empire|800|Frankish Empire;Frankish;Franks
Khmer Empire|802|Angkor
Chola Empire|~848
Holy Roman Empire|962|HRE
Seljuk Empire|1037|Seljuks;Seljuq
Mongol Empire|1206|Mongols;Mongolian;Mongolian Empire
Mali Empire|~1235
Ethiopian Empire|1270|Ethiopia;Abyssinia
Ottoman Empire|1299|Ottomans;Turkish Empire
Vijayanagara Empire|1336|Vijayanagar
Timurid Empire|1370|Timurids
Portuguese Empire|1415|Portugal
Aztec Empire|1428|Aztecs
Inca Empire|1438|Incas;Incan;Incan Empire
Songhai Empire|~1464|Songhay
Spanish Empire|1492|Spain
Safavid Empire|1501|Safavids
Mughal Empire|1526|Mughals;Mogul;Moghul
French Empire|1534|France;French colonial empire;Napoleonic Empire
British Empire|1583|Britain;English Empire
Dutch Empire|1602|Netherlands
Swedish Empire|1611|Sweden
Qing Empire|1636|Qing dynasty;Manchu
Maratha Empire|1674|Marathas
Ashanti Empire|1701|Asante
Russian Empire|1721|Russia
Sikh Empire|1799
Austrian Empire|1804|Austria
Zulu Kingdom|1816|Zulu Empire
Mexican Empire|1821|Mexico
Empire of Brazil|1822|Brazil;Brazilian Empire;Brazilian
Austro-Hungarian Empire|1867|Austria-Hungary
Empire of Japan|1868|Japan;Japanese Empire;Japanese;Imperial Japan
German Empire|1871|Germany;Second Reich
Italian Empire|1882|Italy
Korean Empire|1897|Korea`);

  L('ancient-civs', 1, 'Name a lost or ancient civilisation.', 'when it arose', [-2001, -801], `
Sumer|~-4500|Sumerians;Sumerian;Sumeria;Mesopotamia;Mesopotamian
Norte Chico|~-3500|Caral;Caral-Supe
Indus Valley|~-3300|Indus Valley Civilisation;Indus Valley Civilization;Indus;Harappan;Harappa;Ancient India
Elam|~-3200|Elamites;Elamite
Ancient Egypt|~-3100|Egypt;Egyptians;Egyptian
Minoan|~-3000|Minoans;Minoan Crete;Crete
Assyria|~-2500|Assyrians;Assyrian
Akkad|~-2334|Akkadians;Akkadian
Ancient China|~-2070|China;Chinese;Xia;Shang
Maya|~-2000|Mayans;Mayan;Mayas
Babylon|~-1894|Babylonians;Babylonia;Babylonian
Mycenaean|~-1750|Mycenaeans;Mycenae;Mycenaean Greece
Hittites|~-1650|Hittite
Olmec|~-1500|Olmecs
Phoenicia|~-1500|Phoenicians;Phoenician
Kush|~-1070|Kushites;Nubia;Nubians;Kingdom of Kush
Israel|~-1050|Israelites;Hebrews;Ancient Israel;Judah
Nok|~-1000
Chavín|~-900
Etruscan|~-900.1|Etruscans;Etruria
Scythians|~-900.2|Scythian;Scythia
Carthage|-814|Carthaginians;Carthaginian
Ancient Greece|~-800|Greece;Greeks;Greek
Celts|~-800.1|Celtic;Gauls
Ancient Rome|-753|Rome;Romans;Roman
Zapotec|~-700|Zapotecs
Persia|-550|Persians;Persian;Achaemenid
Nabataean|~-312|Nabataeans;Petra
Nazca|~-100|Nasca
Teotihuacan|~-100.1
Moche|~100|Mochica
Aksum|~100.1|Axum;Aksumite
Inca|~1200|Incas;Incan
Aztec|~1300|Aztecs`);

  L('explorers', 1, 'Name a famous explorer.', 'first great journey', [1449, 1699], `
Hanno the Navigator|~-500|Hanno
Pytheas|~-325
Zhang Qian|-138
Xuanzang|629
Erik the Red|982|Eric the Red
Leif Erikson|~1000|Leif Ericson;Leif Eriksson;Leif Ericsson
Marco Polo|1271
Ibn Battuta|1325|Battuta
Zheng He|1405|Cheng Ho
Henry the Navigator|1415|Prince Henry
Bartolomeu Dias|1487|Bartholomew Diaz;Bartolomeu Diaz;Diaz
Christopher Columbus|1492|Cristoforo Colombo
John Cabot|1497
Vasco da Gama|1497.5|da Gama
Amerigo Vespucci|1499
Pedro Álvares Cabral|1500
Vasco Núñez de Balboa|1513|Vasco de Balboa;Nunez de Balboa
Juan Ponce de León|1513.2|Ponce de Leon
Hernán Cortés|1519|Hernando Cortez;Hernan Cortez;Cortez
Ferdinand Magellan|1519.6
Francisco Pizarro|1524
Jacques Cartier|1534
Hernando de Soto|1539|de Soto
Francisco Vázquez de Coronado|1540
Francis Drake|1577
Walter Raleigh|1584|Ralegh
Willem Barentsz|1594|Barents;William Barents
Samuel de Champlain|1603
Henry Hudson|1607
Abel Tasman|1642
René-Robert de La Salle|1679|La Salle;Robert de La Salle
Vitus Bering|1728
James Cook|1768|Cook
Mungo Park|1795
Alexander von Humboldt|1799
Matthew Flinders|1801
Lewis and Clark|1804|Meriwether Lewis;William Clark;Lewis
Sacagawea|1804.1|Sacajawea
John Franklin|1819
Charles Darwin|1831
David Livingstone|1841
Richard Burton|1853|Richard Francis Burton
John Hanning Speke|1856
Burke and Wills|1860|Robert Burke;William Wills;Burke
Henry Morton Stanley|1871
Robert Peary|1886
Fridtjof Nansen|1888
Robert Falcon Scott|1901|Scott of the Antarctic
Roald Amundsen|1903
Ernest Shackleton|1907
Jacques Cousteau|1943
Thor Heyerdahl|1947
Edmund Hillary|1953
Tenzing Norgay|1953.1|Tenzing;Sherpa Tenzing
Yuri Gagarin|1961
Neil Armstrong|1969
Ranulph Fiennes|1979`, 'P');

  L('inventions', 1, 'Name a famous invention.', 'when it was invented', [999, 1799], `
Wheel|~-3500
Writing|~-3200|Alphabet
Plough|~-3000|Plow
Abacus|~-2400
Coins|~-600|Coinage;Money;Coin
Compass|~-200|Magnetic compass
Concrete|~-150|Cement
Paper|105
Windmill|~650
Paper money|~800|Banknote;Banknotes
Gunpowder|~850
Eyeglasses|~1286|Glasses;Spectacles
Mechanical clock|~1300|Clock
Printing press|1440|Printing;Movable type
Microscope|1590
Thermometer|1593
Telescope|1608
Barometer|1643
Pendulum clock|1656
Piano|1700|Pianoforte
Steam engine|1712
Lightning rod|1752|Lightning conductor
Spinning jenny|1764
Hot air balloon|1783|Balloon
Parachute|1783.5
Bifocals|1784
Power loom|1785
Steamboat|1787|Steamship
Cotton gin|1793
Vaccine|1796|Vaccination;Smallpox vaccine
Battery|1800|Electric battery
Steam locomotive|1804|Locomotive;Train;Railway;Railroad;Steam train
Tin can|1810|Canned food;Can
Stethoscope|1816
Bicycle|1817|Bike
Electric motor|1821|Motor
Photography|1826|Camera;Photograph
Matches|1826.5|Match
Sewing machine|1830
Refrigerator|1834|Fridge;Refrigeration
Revolver|1836
Telegraph|1837
Postage stamp|1840|Stamp
Anaesthesia|1846|Anesthesia;Anaesthetic;Anesthetic
Safety pin|1849
Elevator|1852|Lift
Dynamite|1867
Typewriter|1868
Barbed wire|1874
Telephone|1876|Phone
Phonograph|1877|Gramophone;Record player
Light bulb|1879|Lightbulb;Electric light;Electric light bulb
Machine gun|1884|Maxim gun
Automobile|1886|Car;Motor car;Motorcar
Dishwasher|1886.5
Zip|1893|Zipper
Diesel engine|1893.5
Cinema|1895|Film;Movies;Motion picture;Motion pictures;Cinematograph;Movie camera
Radio|1895.3|Wireless
X-ray|1895.8|X-rays;Xray
Vacuum cleaner|1901|Hoover
Air conditioning|1902|Air conditioner
Aeroplane|1903|Airplane;Plane;Aircraft;Powered flight
Plastic|1907|Bakelite
Stainless steel|1913
Tank|1915
Television|1927|TV;Telly
Penicillin|1928|Antibiotics;Antibiotic
Radar|1935
Jet engine|1937|Jet
Helicopter|1939
Nuclear reactor|1942
Computer|1945|Electronic computer;ENIAC
Atomic bomb|1945.5|Nuclear bomb;Atom bomb;Nuclear weapon;Nuclear weapons
Microwave oven|1945.8|Microwave
Transistor|1947
Credit card|1950
Satellite|1957|Sputnik
Microchip|1958|Integrated circuit;Silicon chip;Chip
Laser|1960
Contraceptive pill|1960.5|Birth control pill;The pill
Internet|1969|ARPANET
Email|1971|E-mail
Mobile phone|1973|Cell phone;Cellphone;Mobile;Cellular phone
Personal computer|1974|PC
GPS|1978|Global Positioning System;Satnav
Compact disc|1982|CD
World Wide Web|1989|Web;WWW
Smartphone|1994|iPhone`);

  L('landmarks', 1, 'Name a famous landmark built by people.', 'when it was built', [0, 1499], `
Göbekli Tepe|~-9500
Newgrange|~-3200
Stonehenge|~-3000
Pyramids of Giza|~-2560|Great Pyramid;Great Pyramid of Giza;Pyramids;Pyramid of Giza;Pyramid;Giza;Pyramid of Khufu;Egyptian pyramids
Great Sphinx|~-2500|Sphinx;Sphinx of Giza
Abu Simbel|~-1264
Parthenon|-447|Acropolis
Petra|~-300
Great Wall of China|~-220|Great Wall;Wall of China
Terracotta Army|~-210|Terracotta Warriors
Pont du Gard|~50
Colosseum|80|Coliseum;Roman Colosseum
Hadrian's Wall|122
Pantheon|126
Pyramid of the Sun|~200|Teotihuacan
Hagia Sophia|537|Aya Sofya
Chichen Itza|~600
Dome of the Rock|691
Mont-Saint-Michel|~708|Mont St Michel
Borobudur|~800
Westminster Abbey|1065
Windsor Castle|~1070
Canterbury Cathedral|1070.5|Canterbury
Tower of London|1078
Edinburgh Castle|~1100
Angkor Wat|~1150|Angkor
Notre-Dame|1163|Notre-Dame de Paris;Notre Dame Cathedral
Leaning Tower of Pisa|1173|Tower of Pisa;Leaning Tower;Pisa
Chartres Cathedral|1194|Chartres
Alhambra|1238
Cologne Cathedral|1248
Easter Island statues|~1250|Moai;Easter Island;Easter Island heads
Florence Cathedral|1296|Duomo;Il Duomo;Duomo di Firenze
Himeji Castle|1333
Charles Bridge|1357
Forbidden City|1420
Machu Picchu|~1450
Sistine Chapel|1473
Kremlin|1482|Moscow Kremlin
St. Peter's Basilica|1506|St Peters;Saint Peter's
St Basil's Cathedral|1555|Saint Basil's;St Basils
Rialto Bridge|1591
Golden Temple|1604|Harmandir Sahib
Blue Mosque|1609|Sultan Ahmed Mosque
Taj Mahal|1632
Red Fort|1639
Potala Palace|1645
Palace of Versailles|1661|Versailles
St Paul's Cathedral|1675|St Pauls;Saint Paul's
Buckingham Palace|1703
Trevi Fountain|1762
Brandenburg Gate|1788
White House|1792
Louvre|1793|Louvre Museum
Arc de Triomphe|1806
Nelson's Column|1840|Trafalgar Square
Big Ben|1859|Elizabeth Tower;Houses of Parliament;Palace of Westminster
Suez Canal|1869
Neuschwanstein Castle|1869.5|Neuschwanstein
Sagrada Família|1882
Brooklyn Bridge|1883
Statue of Liberty|1886
Eiffel Tower|1889
Tower Bridge|1894
Panama Canal|1914
Lincoln Memorial|1922
Hollywood Sign|1923
Empire State Building|1931
Christ the Redeemer|1931.5|Cristo Redentor
Hoover Dam|1936
Golden Gate Bridge|1937|Golden Gate
Mount Rushmore|1941|Rushmore
Berlin Wall|1961
Gateway Arch|1965|St Louis Arch
Sydney Opera House|1973|Opera House
CN Tower|1976
London Eye|2000
Burj Khalifa|2010
The Shard|2012`);

  L('scientists', 1, 'Name a famous scientist.', 'birth', [1599, 1799], `
Thales|~-624
Pythagoras|~-570
Hippocrates|~-460
Aristotle|-384
Euclid|~-325
Archimedes|~-287
Eratosthenes|~-276
Ptolemy|~100
Galen|129
Hypatia|~360
Al-Khwarizmi|~780|Khwarizmi
Alhazen|~965|Ibn al-Haytham
Avicenna|980|Ibn Sina
Roger Bacon|~1219
Leonardo da Vinci|1452|Leonardo;da Vinci
Nicolaus Copernicus|1473
Paracelsus|1493
Andreas Vesalius|1514
Tycho Brahe|1546
Francis Bacon|1561
Galileo Galilei|1564|Galileo
Johannes Kepler|1571
William Harvey|1578
René Descartes|1596
Blaise Pascal|1623
Robert Boyle|1627
Christiaan Huygens|1629
Antonie van Leeuwenhoek|1632|van Leeuwenhoek
Robert Hooke|1635
Isaac Newton|1643
Gottfried Leibniz|1646|Leibnitz
Edmond Halley|1656|Edmund Halley
Daniel Fahrenheit|1686
Anders Celsius|1701
Benjamin Franklin|1706
Carl Linnaeus|1707|Carolus Linnaeus;Linne
Leonhard Euler|1707.3
Henry Cavendish|1731
Joseph Priestley|1733
James Watt|1736
William Herschel|1738
Antoine Lavoisier|1743
Alessandro Volta|1745
Edward Jenner|1749
John Dalton|1766
André-Marie Ampère|1775|Andre Ampere
Carl Friedrich Gauss|1777
Humphry Davy|1778
Georg Ohm|1789
Michael Faraday|1791
Charles Babbage|1791.9
Charles Lyell|1797
Charles Darwin|1809
Ada Lovelace|1815
James Prescott Joule|1818
Gregor Mendel|1822
Louis Pasteur|1822.9
Lord Kelvin|1824|William Thomson
Joseph Lister|1827
James Clerk Maxwell|1831
Alfred Nobel|1833
Dmitri Mendeleev|1834|Mendeleyev
Robert Koch|1843
Wilhelm Röntgen|1845|Roentgen;Wilhelm Roentgen
Thomas Edison|1847
Alexander Graham Bell|1847.2
Ivan Pavlov|1849
Sigmund Freud|1856
Nikola Tesla|1856.5
Heinrich Hertz|1857
Max Planck|1858
Marie Curie|1867|Madame Curie;Marie Sklodowska Curie
Ernest Rutherford|1871
Guglielmo Marconi|1874
Albert Einstein|1879
Alexander Fleming|1881
Niels Bohr|1885
Erwin Schrödinger|1887|Schroedinger
Edwin Hubble|1889
Enrico Fermi|1901
Werner Heisenberg|1901.9
Paul Dirac|1902
J. Robert Oppenheimer|1904|Robert Oppenheimer
Rachel Carson|1907
Dorothy Hodgkin|1910
Alan Turing|1912
Jonas Salk|1914
Francis Crick|1916
Richard Feynman|1918
Katherine Johnson|1918.6
Rosalind Franklin|1920
James Watson|1928
Peter Higgs|1929
Carl Sagan|1934
Jane Goodall|1934.2
Stephen Hawking|1942
Tim Berners-Lee|1955|Berners Lee`, 'P');

  L('writers', 1, 'Name a famous writer.', 'birth', [1499, 1799], `
Homer|~-800
Sappho|~-630
Aesop|~-620
Aeschylus|~-525
Sophocles|~-497
Herodotus|~-484
Euripides|~-480
Aristophanes|~-446
Cicero|-106
Virgil|-70|Vergil
Horace|-65
Ovid|-43
Li Bai|701|Li Po
Murasaki Shikibu|~973|Lady Murasaki;Murasaki
Omar Khayyam|1048
Rumi|1207
Dante Alighieri|1265|Dante
Petrarch|1304
Giovanni Boccaccio|1313
Geoffrey Chaucer|~1343
Thomas Malory|~1415
Niccolò Machiavelli|1469
Thomas More|1478
François Rabelais|~1494
Miguel de Cervantes|1547
Christopher Marlowe|1564
William Shakespeare|1564.3|Shakespear;The Bard
John Donne|1572
Ben Jonson|1572.5
John Milton|1608
Molière|1622
John Bunyan|1628
Samuel Pepys|1633
Daniel Defoe|~1660
Jonathan Swift|1667
Voltaire|1694
Samuel Johnson|1709
Jean-Jacques Rousseau|1712
Johann Wolfgang von Goethe|1749
William Blake|1757
Robert Burns|1759|Rabbie Burns
Mary Wollstonecraft|1759.3
William Wordsworth|1770
Walter Scott|1771
Samuel Taylor Coleridge|1772
Jane Austen|1775
Jacob Grimm|1785|Brothers Grimm
Lord Byron|1788
Percy Bysshe Shelley|1792
John Keats|1795
Mary Shelley|1797
Alexander Pushkin|1799
Honoré de Balzac|1799.4
Victor Hugo|1802
Alexandre Dumas|1802.5
Ralph Waldo Emerson|1803
Hans Christian Andersen|1805
Edgar Allan Poe|1809
Alfred Tennyson|1809.6|Lord Tennyson;Alfred Lord Tennyson
Charles Dickens|1812
Charlotte Brontë|1816
Henry David Thoreau|1817
Emily Brontë|1818
George Eliot|1819
Herman Melville|1819.6
Walt Whitman|1819.4
Fyodor Dostoevsky|1821|Dostoyevsky;Dostoevski
Gustave Flaubert|1821.9
Leo Tolstoy|1828
Jules Verne|1828.1
Emily Dickinson|1830
Lewis Carroll|1832
Louisa May Alcott|1832.9
Mark Twain|1835|Samuel Clemens
Thomas Hardy|1840
Robert Louis Stevenson|1850
Oscar Wilde|1854
George Bernard Shaw|1856
Joseph Conrad|1857
Arthur Conan Doyle|1859|Conan Doyle
Anton Chekhov|1860
Rudyard Kipling|1865
W. B. Yeats|1865.5|William Butler Yeats
H. G. Wells|1866
Beatrix Potter|1866.6
Marcel Proust|1871
Robert Frost|1874
Jack London|1876
James Joyce|1882
Virginia Woolf|1882.1
Franz Kafka|1883
D. H. Lawrence|1885
T. S. Eliot|1888
Agatha Christie|1890
J. R. R. Tolkien|1892
F. Scott Fitzgerald|1896|Scott Fitzgerald
William Faulkner|1897
C. S. Lewis|1898
Ernest Hemingway|1899.6
Vladimir Nabokov|1899.3
Jorge Luis Borges|1899.7
John Steinbeck|1902
George Orwell|1903|Eric Blair
Samuel Beckett|1906
Ian Fleming|1908
Albert Camus|1913
Roald Dahl|1916
J. D. Salinger|1919
Isaac Asimov|1920
Harper Lee|1926
Gabriel García Márquez|1927|Garcia Marquez
Maya Angelou|1928
Chinua Achebe|1930
Toni Morrison|1931
Sylvia Plath|1932
Margaret Atwood|1939
Stephen King|1947
Salman Rushdie|1947.5
Terry Pratchett|1948
Haruki Murakami|1949
Kazuo Ishiguro|1954
J. K. Rowling|1965`, 'P');

  L('painters', 1, 'Name a famous painter.', 'birth', [1449, 1799], `
Giotto|~1267|Giotto di Bondone
Jan van Eyck|~1390|van Eyck
Fra Angelico|~1395
Masaccio|1401
Piero della Francesca|~1415
Sandro Botticelli|~1445
Hieronymus Bosch|~1450
Leonardo da Vinci|1452|Leonardo;da Vinci
Albrecht Dürer|1471
Michelangelo|1475|Michelangelo Buonarroti
Raphael|1483|Raffaello
Titian|~1488
Hans Holbein the Younger|~1497|Holbein;Hans Holbein
Tintoretto|1518
Pieter Bruegel the Elder|~1525|Bruegel;Brueghel;Pieter Bruegel
El Greco|1541
Caravaggio|1571
Peter Paul Rubens|1577
Artemisia Gentileschi|1593
Diego Velázquez|1599
Anthony van Dyck|1599.3|van Dyck
Rembrandt|1606|Rembrandt van Rijn
Johannes Vermeer|1632|Jan Vermeer
Canaletto|1697
William Hogarth|1697.9
Thomas Gainsborough|1727
Francisco Goya|1746
Jacques-Louis David|1748
William Blake|1757
Katsushika Hokusai|1760
Caspar David Friedrich|1774
J. M. W. Turner|1775|William Turner
John Constable|1776
Eugène Delacroix|1798
Édouard Manet|1832
Edgar Degas|1834
James McNeill Whistler|1834.5
Paul Cézanne|1839
Claude Monet|1840
Pierre-Auguste Renoir|1841|Auguste Renoir
Henri Rousseau|1844
Paul Gauguin|1848
Vincent van Gogh|1853|van Gogh
Georges Seurat|1859
Gustav Klimt|1862
Edvard Munch|1863
Henri de Toulouse-Lautrec|1864|Toulouse-Lautrec;Lautrec
Wassily Kandinsky|1866
Henri Matisse|1869
Piet Mondrian|1872
Paul Klee|1879
Pablo Picasso|1881
Edward Hopper|1882
Amedeo Modigliani|1884
Diego Rivera|1886
Marc Chagall|1887
Georgia O'Keeffe|1887.9|O'Keefe;Georgia O'Keefe
L. S. Lowry|1887.8
Joan Miró|1893
René Magritte|1898
Mark Rothko|1903
Salvador Dalí|1904
Frida Kahlo|1907
Francis Bacon|1909
Jackson Pollock|1912
Lucian Freud|1922
Roy Lichtenstein|1923
Andy Warhol|1928
David Hockney|1937
Jean-Michel Basquiat|1960
Banksy|~1974`, 'P');

  L('composers', 1, 'Name a classical composer.', 'birth', [1679, 1799], `
Hildegard of Bingen|1098|Hildegard
Guillaume de Machaut|~1300
Josquin des Prez|~1450|Josquin
Thomas Tallis|~1505
Giovanni Pierluigi da Palestrina|~1525
William Byrd|~1540
Claudio Monteverdi|1567
Jean-Baptiste Lully|1632
Johann Pachelbel|1653
Arcangelo Corelli|1653.2
Henry Purcell|1659
Antonio Vivaldi|1678
Georg Philipp Telemann|1681
Johann Sebastian Bach|1685.3|JS Bach;Bach
George Frideric Handel|1685.2|Händel;Georg Friedrich Händel;Haendel
Domenico Scarlatti|1685.8
Christoph Willibald Gluck|1714
Joseph Haydn|1732|Franz Joseph Haydn
Wolfgang Amadeus Mozart|1756|Mozart
Ludwig van Beethoven|1770
Niccolò Paganini|1782
Carl Maria von Weber|1786
Gioachino Rossini|1792
Franz Schubert|1797
Gaetano Donizetti|1797.9
Hector Berlioz|1803
Felix Mendelssohn|1809|Mendelssohn
Frédéric Chopin|1810
Robert Schumann|1810.4
Franz Liszt|1811
Richard Wagner|1813
Giuseppe Verdi|1813.8
Jacques Offenbach|1819
Clara Schumann|1819.7
Anton Bruckner|1824
Bedřich Smetana|1824.2
Johann Strauss II|1825|Johann Strauss;Johann Strauss Jr;Johann Strauss the Younger
Johannes Brahms|1833
Camille Saint-Saëns|1835|Saint-Saens
Georges Bizet|1838
Modest Mussorgsky|1839
Pyotr Ilyich Tchaikovsky|1840|Peter Tchaikovsky;Tchaikovski;Chaikovsky
Antonín Dvořák|1841
Arthur Sullivan|1842
Edvard Grieg|1843
Nikolai Rimsky-Korsakov|1844|Rimsky-Korsakov
Gabriel Fauré|1845
Edward Elgar|1857
Giacomo Puccini|1858
Gustav Mahler|1860
Claude Debussy|1862
Richard Strauss|1864
Jean Sibelius|1865
Erik Satie|1866
Scott Joplin|1868
Ralph Vaughan Williams|1872|Vaughan Williams
Sergei Rachmaninoff|1873|Rachmaninov
Gustav Holst|1874
Arnold Schoenberg|1874.7|Schönberg
Maurice Ravel|1875
Béla Bartók|1881
Igor Stravinsky|1882
Sergei Prokofiev|1891
George Gershwin|1898
Aaron Copland|1900
Dmitri Shostakovich|1906
Benjamin Britten|1913
Leonard Bernstein|1918
John Williams|1932
Philip Glass|1937
Hans Zimmer|1957`, 'P');

  L('generals', 1, 'Name a famous general or conqueror.', 'first great campaign', [0, 1499], `
Sargon of Akkad|~-2334|Sargon
Thutmose III|~-1479
Ramesses II|~-1279|Ramses II;Rameses II;Ramesses the Great;Ramses the Great
Cyrus the Great|-559|Cyrus
Sun Tzu|~-512|Sunzi
Xerxes|-486|Xerxes I
Leonidas|-480|Leonidas I
Themistocles|-480.1
Pericles|-461
Alexander the Great|-336|Alexander
Chandragupta Maurya|-322|Chandragupta
Pyrrhus|-280|Pyrrhus of Epirus
Qin Shi Huang|-230|Shi Huangdi
Hannibal|-221|Hannibal Barca
Scipio Africanus|-210|Scipio
Gaius Marius|-107|Marius
Sulla|-88
Spartacus|-73
Pompey|-67|Pompey the Great
Julius Caesar|-58|Caesar;Gaius Julius Caesar
Vercingetorix|-52
Mark Antony|-44|Marc Antony;Marcus Antonius
Arminius|9|Hermann
Boudica|60|Boadicea;Boudicca
Trajan|101
Attila the Hun|434|Attila
Belisarius|527
Khalid ibn al-Walid|632|Khalid
Charles Martel|732
Charlemagne|768|Charles the Great
El Cid|1065|Rodrigo Diaz de Vivar
William the Conqueror|1066|William I
Saladin|1174|Salah ad-Din
Richard the Lionheart|1189|Richard I
Genghis Khan|1206|Chinggis Khan;Temujin;Genghis
Kublai Khan|1260|Kublai
William Wallace|1297
Robert the Bruce|1306
Edward the Black Prince|1346|Black Prince
Tamerlane|1370|Timur
Henry V|1415
Joan of Arc|1429|Jeanne d'Arc
Mehmed the Conqueror|1451|Mehmed II
Hernán Cortés|1519|Hernando Cortez;Hernan Cortez;Cortez
Suleiman the Magnificent|1520|Suleiman
Babur|1526
Francisco Pizarro|1532
Akbar|1556|Akbar the Great
Oda Nobunaga|1560
Toyotomi Hideyoshi|1582
Tokugawa Ieyasu|1600
Gustavus Adolphus|1611
Oliver Cromwell|1642
Peter the Great|1700
Duke of Marlborough|1702|John Churchill
Frederick the Great|1740|Frederick II
George Washington|1775
Napoleon Bonaparte|1796|Napoleon;Napoleon I
Horatio Nelson|1798|Lord Nelson;Admiral Nelson
Duke of Wellington|1808|Arthur Wellesley
Simón Bolívar|1813
Shaka Zulu|1816|Shaka
Giuseppe Garibaldi|1848
Robert E. Lee|1861
Ulysses S. Grant|1861.2|US Grant
William Tecumseh Sherman|1861.4
Stonewall Jackson|1861.6|Thomas Jackson
George Custer|1876|George Armstrong Custer
Sitting Bull|1876.1
Ferdinand Foch|1914
Douglas Haig|1915
T. E. Lawrence|1916|Lawrence of Arabia
John J. Pershing|1917|Black Jack Pershing
Mao Zedong|1934|Mao;Mao Tse-tung
Erwin Rommel|1940
Charles de Gaulle|1940.5|de Gaulle
Douglas MacArthur|1941
Georgy Zhukov|1941.5
Isoroku Yamamoto|1941.9
Bernard Montgomery|1942|Monty
Dwight D. Eisenhower|1942.5|Ike
George S. Patton|1942.8
Võ Nguyên Giáp|1954|Giap;General Giap
Che Guevara|1956
Norman Schwarzkopf|1991`, 'P');

  L('eras', 1, 'Name an age or era of history.', 'when it began', [-1000, 1499], `
Ice Age|~-2600000|Pleistocene;Last Ice Age
Stone Age|~-3300000|Paleolithic;Palaeolithic;Old Stone Age
Mesolithic|~-10000|Middle Stone Age
Neolithic|~-9500|New Stone Age
Copper Age|~-4500|Chalcolithic
Bronze Age|~-3300
Iron Age|~-1200
Classical antiquity|~-800|Antiquity;Classical Age;Classical;Ancient history
Hellenistic period|-323|Hellenistic Age
Pax Romana|-27|Roman peace
Late antiquity|~284
Middle Ages|476|Medieval;Medieval period;Mediaeval;Medieval era
Dark Ages|476.1|Early Middle Ages
Islamic Golden Age|~750|Golden Age of Islam
Viking Age|793|Vikings
High Middle Ages|~1000
Renaissance|~1300|Italian Renaissance
Age of Discovery|~1418|Age of Exploration;Exploration
Tudor period|1485|Tudors
Reformation|1517|Protestant Reformation
Scientific Revolution|1543
Elizabethan era|1558
Baroque|~1600
Edo period|1603|Tokugawa
Stuart period|1603.1|Stuarts;Jacobean
Golden Age of Piracy|~1650|Age of Piracy
Age of Enlightenment|~1685|Age of Reason
Georgian era|1714
Industrial Revolution|~1760|Industrial Age
Age of Revolution|1775|Age of Revolutions
Romantic era|~1798|Romanticism
Napoleonic era|1799
Regency era|1811
Victorian era|1837
Wild West|~1865|Old West;American frontier
Reconstruction era|1865.1
Meiji era|1868|Meiji Restoration
Gilded Age|~1870
Belle Époque|1871
Machine Age|~1880
Progressive Era|~1896
Edwardian era|1901
Interwar period|1918|Inter-war
Roaring Twenties|1920|Jazz Age;Twenties;1920s;Roaring 20s
Prohibition|1920.1
Great Depression|1929|Depression
Atomic Age|1945|Nuclear Age
Postwar era|1945.5|Post-war
Cold War|1947
Space Age|1957
Swinging Sixties|~1960|Sixties;1960s
Information Age|~1970|Digital Age;Computer Age;Internet Age`);

  L('revolutions', 1, 'Name a revolution.', 'when it began', [1699, 1899], `
Neolithic Revolution|~-10000|Agricultural Revolution;First Agricultural Revolution
Scientific Revolution|1543
English Revolution|1642|English Civil War;Puritan Revolution
Glorious Revolution|1688|Revolution of 1688
Industrial Revolution|~1760
American Revolution|1765|American War of Independence
French Revolution|1789
Haitian Revolution|1791|Haiti
Greek Revolution|1821|Greek War of Independence
July Revolution|1830|French Revolution of 1830
Belgian Revolution|1830.5
Texas Revolution|1835|Texan
Revolutions of 1848|1848|Springtime of Nations;1848 Revolutions;Spring of Nations
Meiji Restoration|1868|Meiji
Paris Commune|1871|Commune
Young Turk Revolution|1908|Young Turks
Mexican Revolution|1910
Xinhai Revolution|1911|Chinese Revolution;1911 Revolution
Russian Revolution|1917|October Revolution;February Revolution;Bolshevik Revolution
German Revolution|1918|November Revolution
Chinese Communist Revolution|1949|Communist Revolution
Egyptian Revolution|1952
Cuban Revolution|1953
Hungarian Revolution|1956|Hungarian Uprising
Green Revolution|~1960
Cultural Revolution|1966
Carnation Revolution|1974|Portuguese Revolution
Digital Revolution|~1975|Information Revolution
Iranian Revolution|1979|Islamic Revolution
People Power Revolution|1986|People Power;EDSA
Velvet Revolution|1989
Romanian Revolution|1989.9
Rose Revolution|2003
Orange Revolution|2004
Arab Spring|2010|Tunisian Revolution;Jasmine Revolution
Revolution of Dignity|2014|Maidan;Euromaidan`);

  L('ww2-battles', 1, 'Name a battle of the Second World War.', 'when it was fought', [1940.99, 1942.99], `
Westerplatte|1939.67
Atlantic|1939.68|Battle of the Atlantic
River Plate|1939.95
Narvik|1940.27
France|1940.36|Fall of France
Dunkirk|1940.4|Dunkerque;Dynamo
Britain|1940.52|Battle of Britain;The Blitz;Blitz
Taranto|1940.86
Tobruk|1941.28|Siege of Tobruk
Crete|1941.38
Barbarossa|1941.47|Operation Barbarossa
Leningrad|1941.68|Siege of Leningrad
Moscow|1941.75
Pearl Harbor|1941.93
Hong Kong|1941.94
Bataan|1942.02
Singapore|1942.1|Fall of Singapore
Coral Sea|1942.34
Midway|1942.43
Guadalcanal|1942.6
Dieppe|1942.63|Dieppe Raid
Stalingrad|1942.64
El Alamein|1942.8|Alamein
Kasserine Pass|1943.13|Kasserine
Kursk|1943.5
Sicily|1943.52|Invasion of Sicily;Operation Husky;Husky
Monte Cassino|1944.05|Cassino
Anzio|1944.06
Imphal|1944.18|Kohima;Imphal and Kohima
Normandy|1944.43|D-Day;DDay;Normandy landings;Overlord;Operation Overlord
Philippine Sea|1944.46
Warsaw Uprising|1944.58|Warsaw
Arnhem|1944.71|Market Garden;Operation Market Garden
Leyte Gulf|1944.81|Leyte
The Bulge|1944.96|Ardennes
Budapest|1944.99|Siege of Budapest
Iwo Jima|1945.13
Remagen|1945.18
Okinawa|1945.25
Berlin|1945.29`);

  L('philosophers', 1, 'Name a famous philosopher.', 'birth', [-450, 1599], `
Thales|~-624
Laozi|~-571|Lao Tzu;Lao-Tzu;Lao Tse;Laotzu
Pythagoras|~-570
Siddhartha Gautama|~-563|Buddha;Gautama Buddha
Confucius|-551|Kong Fuzi;Kongzi
Heraclitus|~-535
Parmenides|~-515
Zeno of Elea|~-490|Zeno
Socrates|~-470
Democritus|~-460
Plato|~-428
Diogenes|~-412|Diogenes of Sinope
Aristotle|-384
Mencius|~-372|Mengzi
Zhuangzi|~-369|Chuang Tzu
Epicurus|-341
Zeno of Citium|~-334|Zeno
Cicero|-106
Lucretius|~-99
Seneca|~-4|Seneca the Younger
Epictetus|~50
Marcus Aurelius|121
Plotinus|~204
Augustine of Hippo|354|Augustine;Saint Augustine
Boethius|~477
Avicenna|980|Ibn Sina
Anselm|1033|Anselm of Canterbury
Averroes|1126|Ibn Rushd
Maimonides|1138
Thomas Aquinas|1225
William of Ockham|~1287|Ockham;Occam
Erasmus|1466|Desiderius Erasmus
Niccolò Machiavelli|1469
Thomas More|1478
Michel de Montaigne|1533
Francis Bacon|1561
Thomas Hobbes|1588
René Descartes|1596
Blaise Pascal|1623
Baruch Spinoza|1632|Benedict Spinoza
John Locke|1632.6
Gottfried Leibniz|1646|Leibnitz
George Berkeley|1685|Bishop Berkeley
Montesquieu|1689
Voltaire|1694
David Hume|1711
Jean-Jacques Rousseau|1712
Adam Smith|1723
Immanuel Kant|1724
Edmund Burke|1729
Jeremy Bentham|1748
Mary Wollstonecraft|1759
Georg Wilhelm Friedrich Hegel|1770|Georg Hegel
Arthur Schopenhauer|1788
John Stuart Mill|1806|JS Mill
Søren Kierkegaard|1813
Karl Marx|1818
Friedrich Engels|1820
William James|1842
Friedrich Nietzsche|1844|Nietzche;Nietsche
Bertrand Russell|1872
Ludwig Wittgenstein|1889
Martin Heidegger|1889.7
Karl Popper|1902
Jean-Paul Sartre|1905
Hannah Arendt|1906
Simone de Beauvoir|1908|de Beauvoir
Albert Camus|1913
John Rawls|1921
Michel Foucault|1926
Noam Chomsky|1928`, 'P');

  L('ships', 1, 'Name a famous ship.', 'launch or famous voyage', [1699, 1899], `
Santa María|1492
Niña|1492.1
Pinta|1492.2
Mary Rose|1511
Victoria|1519
Golden Hind|1577|Golden Hinde;Pelican
Mayflower|1620
Vasa|1627|Wasa
Queen Anne's Revenge|1710
HMS Endeavour|1764|Endeavor
HMS Victory|1765
HMS Bounty|1787
USS Constitution|1797|Old Ironsides
HMS Beagle|1820
Amistad|1839|La Amistad
SS Great Britain|1843
SS Great Eastern|1858
HMS Warrior|1860
Mary Celeste|1861|Marie Celeste
USS Monitor|1862
Cutty Sark|1869
USS Maine|1889
Fram|1892
Potemkin|1900|Battleship Potemkin
RRS Discovery|1901
RMS Carpathia|1902
HMS Dreadnought|1906
RMS Lusitania|1906.5
RMS Olympic|1910
RMS Titanic|1911
Endurance|1912
HMHS Britannic|1914
USS Arizona|1915
HMS Hood|1918
RMS Queen Mary|1934
Graf Spee|1934.5|Admiral Graf Spee
USS Enterprise|1936
HMS Ark Royal|1937
HMS Belfast|1938
General Belgrano|1938.5|Belgrano
Bismarck|1939
Yamato|1940
USS Missouri|1944|Mighty Mo
Kon-Tiki|1947
HMY Britannia|1953|Royal Yacht Britannia
USS Nautilus|1954
Rainbow Warrior|1955
Queen Elizabeth 2|1967|QE2
Exxon Valdez|1986`);

  L('olympics', 1, 'Name a city that has hosted the Summer Olympics.', 'its first Games', [1912, 1960], `
Athens|1896
Paris|1900
St. Louis|1904
London|1908
Stockholm|1912
Antwerp|1920
Amsterdam|1928
Los Angeles|1932|LA
Berlin|1936
Helsinki|1952
Melbourne|1956
Rome|1960
Tokyo|1964
Mexico City|1968
Munich|1972
Montreal|1976
Moscow|1980
Seoul|1988
Barcelona|1992
Atlanta|1996
Sydney|2000
Beijing|2008|Peking
Rio de Janeiro|2016|Rio`);

  // ======================= tier 2 =======================

  L('uk-pms', 2, 'Name a British prime minister.', 'start of first term', [1799, 1899], `
Robert Walpole|1721
Spencer Compton|1742|Earl of Wilmington
Henry Pelham|1743
Duke of Newcastle|1754|Thomas Pelham-Holles
Duke of Devonshire|1756|William Cavendish
Earl of Bute|1762|Lord Bute;John Stuart
George Grenville|1763
Marquess of Rockingham|1765|Lord Rockingham
William Pitt the Elder|1766|Pitt the Elder;Earl of Chatham;Pitt
Duke of Grafton|1768
Lord North|1770|Frederick North
Earl of Shelburne|1782|Lord Shelburne
Duke of Portland|1783|William Cavendish-Bentinck
William Pitt the Younger|1783.9|Pitt the Younger;Pitt
Henry Addington|1801
William Grenville|1806|Lord Grenville
Spencer Perceval|1809
Earl of Liverpool|1812|Lord Liverpool;Robert Jenkinson
George Canning|1827
Viscount Goderich|1827.6|Lord Goderich;Frederick Robinson
Duke of Wellington|1828|Arthur Wellesley
Earl Grey|1830|Lord Grey;Charles Grey
Viscount Melbourne|1834|Lord Melbourne;William Lamb
Robert Peel|1834.9
Lord John Russell|1846|Earl Russell
Earl of Derby|1852|Lord Derby;Edward Smith-Stanley
Earl of Aberdeen|1852.9|Lord Aberdeen
Viscount Palmerston|1855|Lord Palmerston;Henry John Temple
Benjamin Disraeli|1868
William Gladstone|1868.9|William Ewart Gladstone
Marquess of Salisbury|1885|Lord Salisbury;Robert Gascoyne-Cecil
Earl of Rosebery|1894|Lord Rosebery
Arthur Balfour|1902
Henry Campbell-Bannerman|1905|Campbell-Bannerman
H. H. Asquith|1908|Herbert Asquith
David Lloyd George|1916|Lloyd George
Bonar Law|1922|Andrew Bonar Law
Stanley Baldwin|1923
Ramsay MacDonald|1924
Neville Chamberlain|1937
Winston Churchill|1940
Clement Attlee|1945
Anthony Eden|1955
Harold Macmillan|1957
Alec Douglas-Home|1963|Douglas-Home
Harold Wilson|1964
Edward Heath|1970|Ted Heath
James Callaghan|1976|Jim Callaghan
Margaret Thatcher|1979|Maggie Thatcher
John Major|1990
Tony Blair|1997
Gordon Brown|2007
David Cameron|2010
Theresa May|2016
Boris Johnson|2019|Boris
Liz Truss|2022|Elizabeth Truss
Rishi Sunak|2022.8
Keir Starmer|2024
Andy Burnham|2026`, 'P');

  L('french-monarchs', 2, 'Name a king or emperor of France.', 'start of reign', [986, 1588], `
Clovis I|481|Clovis
Dagobert I|629
Pepin the Short|751|Pepin;Pippin the Short;Pepin III
Charlemagne|768|Charles the Great;Charles I
Louis the Pious|814|Louis I
Charles the Bald|843|Charles II
Louis the Stammerer|877|Louis II
Louis III|879
Carloman II|879.5
Charles the Fat|884
Odo|888|Eudes
Charles the Simple|898|Charles III
Robert I|922
Rudolph|923|Raoul;Rudolf
Louis IV|936
Lothair|954
Louis V|986
Hugh Capet|987
Robert II|996|Robert the Pious
Henry I|1031
Philip I|1060
Louis VI|1108|Louis the Fat
Louis VII|1137
Philip II|1180|Philip Augustus;Philippe Auguste
Louis VIII|1223
Louis IX|1226|Saint Louis
Philip III|1270
Philip IV|1285|Philip the Fair
Louis X|1314
Philip V|1316
Charles IV|1322
Philip VI|1328
John II|1350|John the Good
Charles V|1364
Charles VI|1380
Charles VII|1422
Louis XI|1461
Charles VIII|1483
Louis XII|1498
Francis I|1515|François I
Henry II|1547
Francis II|1559
Charles IX|1560
Henry III|1574
Henry IV|1589|Henry of Navarre
Louis XIII|1610
Louis XIV|1643|Sun King;Louis the Great
Louis XV|1715
Louis XVI|1774
Napoleon|1804|Napoleon I;Napoleon Bonaparte;Bonaparte
Louis XVIII|1814
Charles X|1824
Louis-Philippe|1830|Louis Philippe I
Napoleon III|1852|Louis-Napoleon`);

  L('russian-tsars', 2, 'Name a tsar or emperor of Russia.', 'start of reign', [1681, 1800], `
Ivan the Terrible|1547|Ivan IV
Feodor I|1584|Fyodor I
Boris Godunov|1598|Godunov
False Dmitry I|1605|False Dmitri;Dmitry I
Vasili IV|1606|Vasily Shuisky;Vasily IV
Michael I|1613|Mikhail Romanov;Michael Romanov;Mikhail I
Alexis|1645|Alexei;Aleksei;Alexis I
Feodor III|1676|Fyodor III
Ivan V|1682
Peter the Great|1682.4|Peter I
Catherine I|1725
Peter II|1727
Anna|1730|Anna Ivanovna;Anne
Ivan VI|1740
Elizabeth|1741|Elizaveta;Elizabeth Petrovna
Peter III|1762
Catherine the Great|1762.5|Catherine II
Paul I|1796
Alexander I|1801
Nicholas I|1825
Alexander II|1855
Alexander III|1881
Nicholas II|1894`);

  L('chinese-dynasties', 2, 'Name a Chinese dynasty.', 'founding', [-222, 959], `
Xia|~-2070|Hsia
Shang|~-1600|Yin
Zhou|~-1046|Chou;Western Zhou;Eastern Zhou
Qin|-221|Chin;Ch'in
Han|-202|Western Han;Eastern Han
Xin|9
Three Kingdoms|220|Wei;Shu;Wu;Cao Wei;Shu Han
Jin|266|Western Jin;Eastern Jin
Northern and Southern dynasties|420|Northern Wei;Liu Song;Southern dynasties;Northern dynasties;Northern Qi;Northern Zhou;Southern Qi;Liang;Chen;Eastern Wei;Western Wei
Sui|581
Tang|618|T'ang
Five Dynasties and Ten Kingdoms|907|Five Dynasties;Later Liang;Later Tang;Later Jin;Later Han;Later Zhou
Liao|916|Khitan
Song|960|Sung;Northern Song;Southern Song
Western Xia|1038|Xi Xia;Tangut
Jurchen Jin|1115|Great Jin;Jurchen
Yuan|1271|Mongol
Ming|1368
Qing|1644|Ching;Ch'ing;Manchu`);

  L('pharaohs', 2, 'Name a pharaoh of ancient Egypt.', 'start of reign', [-2000, -1071], `
Narmer|~-3100|Menes
Djoser|~-2670|Zoser
Sneferu|~-2613|Snefru
Khufu|~-2589|Cheops
Khafre|~-2558|Chephren
Menkaure|~-2532|Mycerinus
Unas|~-2345
Pepi II|~-2278|Pepy II
Mentuhotep II|~-2061
Amenemhat I|~-1991
Senusret III|~-1878|Sesostris III
Sobekneferu|~-1806
Ahmose I|~-1550
Amenhotep I|~-1525
Thutmose I|~-1506|Tuthmosis I
Thutmose II|~-1493|Tuthmosis II
Hatshepsut|~-1479
Thutmose III|~-1479.1|Tuthmosis III
Amenhotep II|~-1427
Thutmose IV|~-1401|Tuthmosis IV
Amenhotep III|~-1391
Akhenaten|~-1353|Amenhotep IV;Akhenaton
Smenkhkare|~-1335
Tutankhamun|~-1332|Tutankhamen;King Tut;Tut;Tutankhamon
Ay|~-1323
Horemheb|~-1319
Ramesses I|~-1292|Ramses I;Rameses I
Seti I|~-1290|Sethos I
Ramesses II|~-1279|Ramses II;Rameses II;Ramesses the Great;Ramses the Great;Ozymandias
Merneptah|~-1213
Ramesses III|~-1186|Ramses III;Rameses III
Shoshenq I|~-943|Sheshonk
Taharqa|~-690
Psamtik I|~-664|Psammetichus
Necho II|~-610
Amasis II|~-570|Ahmose II
Nectanebo II|~-360
Alexander the Great|-332|Alexander
Ptolemy I|-305|Ptolemy I Soter;Ptolemy Soter
Ptolemy II|-283
Ptolemy XIII|-51.5
Cleopatra|-51|Cleopatra VII
Ptolemy XV|-44|Caesarion`);

  L('soviet-leaders', 2, 'Name a leader of the Soviet Union or Russia since 1917.', 'coming to power', [1917, 1953.9], `
Vladimir Lenin|1917
Joseph Stalin|1924|Josef Stalin
Georgy Malenkov|1953
Nikita Khrushchev|1953.7|Kruschev;Khruschev;Krushchev
Leonid Brezhnev|1964
Yuri Andropov|1982
Konstantin Chernenko|1984
Mikhail Gorbachev|1985|Gorbachov
Boris Yeltsin|1991
Vladimir Putin|2000
Dmitry Medvedev|2008|Dmitri Medvedev`, 'P');

  L('wives', 2, 'Name a wife of Henry VIII.', 'wedding', [1509, 1536], `
Catherine of Aragon|1509|Katherine of Aragon;Aragon;Catherine;Katherine
Anne Boleyn|1533|Ann Boleyn;Boleyn;Anne
Jane Seymour|1536|Seymour;Jane
Anne of Cleves|1540|Anna of Cleves;Cleves;Anne
Catherine Howard|1540.5|Katherine Howard;Kathryn Howard;Howard;Catherine;Katherine
Catherine Parr|1543|Katherine Parr;Parr;Catherine;Katherine`);

  L('wonders', 2, 'Name one of the Seven Wonders of the Ancient World.', 'when it was built', [-2000, -500], `
Great Pyramid of Giza|~-2560|Pyramids;Great Pyramid;Pyramid of Giza;Pyramids of Giza;Pyramid;Giza;Pyramid of Khufu
Hanging Gardens of Babylon|~-600|Hanging Gardens;Gardens of Babylon
Temple of Artemis|~-550|Temple of Artemis at Ephesus;Artemis;Temple of Diana;Artemision
Statue of Zeus at Olympia|~-435|Statue of Zeus;Zeus;Zeus at Olympia
Mausoleum at Halicarnassus|~-351|Mausoleum;Mausoleum of Halicarnassus;Halicarnassus;Tomb of Mausolus
Colossus of Rhodes|~-280|Colossus;Rhodes
Lighthouse of Alexandria|~-279|Pharos;Lighthouse;Pharos of Alexandria;Alexandria`);

  L('royal-houses', 2, 'Name a royal house that has ruled England or Britain.', 'when it took the throne', [1066, 1485], `
Wessex|802|Anglo-Saxon;Saxon
Denmark|1013|Knytlinga;Danish
Normandy|1066|Norman;Normans
Blois|1135
Plantagenet|1154|Angevin;Anjou;Plantagenets
Lancaster|1399|Lancastrian
York|1461|Yorkist
Tudor|1485|Tudors
Stuart|1603|Stewart;Stuarts
Orange-Nassau|1689|Orange;Nassau
Hanover|1714|Hanoverian;Hanoverians
Saxe-Coburg and Gotha|1901|Saxe-Coburg;Saxe-Coburg-Gotha
Windsor|1917|Windsors`);

  L('space', 2, 'Name a space mission or programme.', 'launch', [1960, 1979], `
Sputnik|1957|Sputnik 1
Explorer|1958|Explorer 1
Pioneer|1958.2|Pioneer 10;Pioneer 11
Project Mercury|1958.8|Mercury programme;Mercury program
Luna|1959|Luna 2;Luna 9;Lunik
Apollo|1961|Apollo programme;Apollo program;Apollo 11;Apollo 13;Apollo 8
Vostok|1961.3|Vostok 1
Venera|1961.4
Mariner|1962
Gemini|1964
Voskhod|1964.8
Soyuz|1967
Salyut|1971
Skylab|1973
Viking|1975|Viking 1
Apollo-Soyuz|1975.5
Voyager|1977|Voyager 1;Voyager 2
Space Shuttle|1981|Shuttle;Columbia;Challenger;Discovery;Atlantis;Endeavour;STS
Mir|1986
Magellan|1989
Galileo|1989.8
Hubble|1990|Hubble Space Telescope
Mars Pathfinder|1996|Pathfinder;Sojourner
Cassini|1997|Cassini-Huygens
International Space Station|1998|ISS;Space Station
Shenzhou|1999
Spirit and Opportunity|2003|Spirit;Opportunity;Mars Exploration Rover;Mars Exploration Rovers
Rosetta|2004|Philae
New Horizons|2006
Chang'e|2007
Chandrayaan|2008
Kepler|2009
Curiosity|2011|Mars Science Laboratory
Juno|2011.6
Tiangong|2011.7
Crew Dragon|2020|Dragon;SpaceX Dragon
Perseverance|2020.5|Mars 2020;Ingenuity
James Webb Space Telescope|2021|James Webb;JWST;Webb;Webb Telescope
Artemis|2022|Artemis I`);

  L('queens', 2, 'Name a queen or empress who ruled in her own right.', 'start of reign', [999, 1699], `
Sobekneferu|~-1806
Hatshepsut|~-1479
Cleopatra|-51|Cleopatra VII
Boudica|60|Boadicea;Boudicca
Himiko|~189
Zenobia|267
Seondeok|632|Seondeok of Silla
Wu Zetian|690|Empress Wu;Wu Zhao
Irene of Athens|797|Irene
Matilda|1141|Empress Matilda;Maud
Tamar of Georgia|1184|Tamar;Tamara
Razia Sultana|1236|Razia;Raziya
Jadwiga of Poland|1384|Jadwiga;Hedwig
Margaret I of Denmark|1387|Margaret I;Margrethe I
Isabella I of Castile|1474|Isabella of Castile;Isabella I;Isabel
Joanna of Castile|1504|Juana la Loca;Joanna the Mad;Juana;Joanna
Mary, Queen of Scots|1542|Mary Stuart;Mary I of Scotland
Lady Jane Grey|1553
Mary I of England|1553.5|Mary I;Mary Tudor;Bloody Mary
Elizabeth I|1558
Nzinga of Ndongo|1624|Nzinga;Njinga
Christina of Sweden|1632|Christina;Kristina
Mary II|1689
Anne|1702|Anne of Great Britain
Catherine I of Russia|1725|Catherine I
Anna of Russia|1730|Anna Ivanovna;Anna
Maria Theresa|1740|Maria Theresia
Elizabeth of Russia|1741|Elizabeth Petrovna
Catherine the Great|1762|Catherine II
Maria I of Portugal|1777|Maria I
Ranavalona I|1828
Isabella II of Spain|1833|Isabella II
Victoria|1837
Wilhelmina|1890|Wilhelmina of the Netherlands
Liliuokalani|1891|Lili'uokalani
Salote Tupou III|1918|Salote
Juliana|1948|Juliana of the Netherlands
Elizabeth II|1952
Margrethe II|1972|Margrethe II of Denmark
Beatrix|1980|Beatrix of the Netherlands`);

  L('documents', 2, 'Name a famous treaty, charter or declaration.', 'when it was made', [1499, 1799], `
Code of Hammurabi|~-1754|Hammurabi;Hammurabi's Code
Treaty of Kadesh|~-1259
Twelve Tables|~-450
Edict of Milan|313
Treaty of Verdun|843
Domesday Book|1086|Doomsday Book;Domesday
Magna Carta|1215
Declaration of Arbroath|1320|Arbroath
Treaty of Tordesillas|1494
Ninety-five Theses|1517|95 Theses;Luther's Theses
Peace of Augsburg|1555
Edict of Nantes|1598
Mayflower Compact|1620
Petition of Right|1628
Peace of Westphalia|1648|Treaty of Westphalia
Habeas Corpus Act|1679|Habeas Corpus
English Bill of Rights|1689|Bill of Rights 1689;Bill of Rights
Acts of Union|1707|Act of Union;Treaty of Union
Treaty of Utrecht|1713
Treaty of Paris|1763|Peace of Paris
Declaration of Independence|1776|US Declaration of Independence;American Declaration of Independence
Articles of Confederation|1777
US Constitution|1787|Constitution;United States Constitution;American Constitution;Constitution of the United States
Declaration of the Rights of Man|1789|Rights of Man;Declaration of the Rights of Man and of the Citizen
US Bill of Rights|1791|Bill of Rights
Louisiana Purchase|1803
Napoleonic Code|1804|Code Napoleon;Code Civil
Treaty of Ghent|1814
Congress of Vienna|1815|Treaty of Vienna;Vienna
Monroe Doctrine|1823
Treaty of Waitangi|1840
Treaty of Nanking|1842|Nanjing;Treaty of Nanjing
Communist Manifesto|1848
Treaty of Guadalupe Hidalgo|1848.1
Emancipation Proclamation|1863
Geneva Convention|1864|Geneva Conventions;Geneva
British North America Act|1867
Treaty of Berlin|1878|Congress of Berlin
Entente Cordiale|1904
Balfour Declaration|1917|Balfour
Treaty of Brest-Litovsk|1918
Treaty of Versailles|1919
Anglo-Irish Treaty|1921
Treaty of Lausanne|1923
Kellogg-Briand Pact|1928|Kellogg-Briand
Munich Agreement|1938|Munich
Molotov-Ribbentrop Pact|1939|Nazi-Soviet Pact;Molotov-Ribbentrop
Atlantic Charter|1941
UN Charter|1945|United Nations Charter;Charter of the United Nations
Universal Declaration of Human Rights|1948|Declaration of Human Rights;UDHR
North Atlantic Treaty|1949|NATO;NATO treaty;Washington Treaty
Warsaw Pact|1955
Treaty of Rome|1957
Antarctic Treaty|1959
Nuclear Non-Proliferation Treaty|1968|Non-Proliferation Treaty;NPT
Camp David Accords|1978|Camp David
Maastricht Treaty|1992|Treaty on European Union
Oslo Accords|1993|Oslo
Kyoto Protocol|1997|Kyoto
Good Friday Agreement|1998|Belfast Agreement
Treaty of Lisbon|2007
Paris Agreement|2015|Paris Climate Agreement;Paris Accord;Paris climate accord`);

  // ======================= tier 3 =======================

  L('ottoman-sultans', 3, 'Name an Ottoman sultan.', 'start of reign', [1450, 1699], `
Osman I|1299
Orhan|1324
Murad I|1362
Bayezid I|1389
Mehmed I|1413
Murad II|1421
Mehmed II|1444|Mehmed the Conqueror
Bayezid II|1481
Selim I|1512|Selim the Grim
Suleiman the Magnificent|1520|Suleiman I;Suleyman
Selim II|1566
Murad III|1574
Mehmed III|1595
Ahmed I|1603
Mustafa I|1617
Osman II|1618
Murad IV|1623
Ibrahim|1640
Mehmed IV|1648
Suleiman II|1687
Ahmed II|1691
Mustafa II|1695
Ahmed III|1703
Mahmud I|1730
Osman III|1754
Mustafa III|1757
Abdul Hamid I|1774|Abdulhamid I
Selim III|1789
Mustafa IV|1807
Mahmud II|1808
Abdulmejid I|1839|Abdul Mejid I
Abdulaziz|1861|Abdul Aziz
Murad V|1876
Abdul Hamid II|1876.6|Abdulhamid II
Mehmed V|1909
Mehmed VI|1918`);

  L('mughal-emperors', 3, 'Name a Mughal emperor.', 'start of reign', [1555, 1657], `
Babur|1526
Humayun|1530
Akbar|1556|Akbar the Great
Jahangir|1605
Shah Jahan|1628
Aurangzeb|1658|Alamgir
Bahadur Shah I|1707
Jahandar Shah|1712
Farrukhsiyar|1713
Muhammad Shah|1719
Ahmad Shah Bahadur|1748
Alamgir II|1754
Shah Alam II|1760
Akbar II|1806
Bahadur Shah Zafar|1837|Bahadur Shah II`);

  L('japanese-periods', 3, 'Name a period of Japanese history.', 'when it began', [709, 1602], `
Jomon|~-14000
Yayoi|~-300
Kofun|~300
Asuka|538
Nara|710
Heian|794
Kamakura|1185
Muromachi|1336|Ashikaga
Sengoku|1467|Warring States
Azuchi-Momoyama|1568|Momoyama
Edo|1603|Tokugawa
Meiji|1868
Taisho|1912
Showa|1926
Heisei|1989
Reiwa|2019`);

  L('ww1-battles', 3, 'Name a battle of the First World War.', 'when it was fought', [1914.99, 1916.99], `
Mons|1914.64
Tannenberg|1914.65
Heligoland Bight|1914.66
The Marne|1914.68
Ypres|1914.8
Coronel|1914.84
Falkland Islands|1914.94|Falklands
Dogger Bank|1915.07
Gallipoli|1915.15
Neuve Chapelle|1915.2
Isonzo|1915.47
Loos|1915.73
Verdun|1916.14
Jutland|1916.41
Brusilov Offensive|1916.42|Brusilov
The Somme|1916.5
Arras|1917.27
Vimy Ridge|1917.28|Vimy
Messines|1917.43
Passchendaele|1917.58
Caporetto|1917.8
Cambrai|1917.88
Spring Offensive|1918.22|Kaiserschlacht
Belleau Wood|1918.42
Amiens|1918.6
Megiddo|1918.72
Meuse-Argonne|1918.74|Argonne`);

  L('napoleonic-battles', 3, 'Name a battle of the French Revolutionary or Napoleonic Wars.', 'when it was fought', [1799.99, 1809.99], `
Valmy|1792.72
Toulon|1793|Siege of Toulon
Lodi|1796
Arcole|1796.8
Rivoli|1797
The Pyramids|1798
The Nile|1798.6|Aboukir Bay
Marengo|1800
Copenhagen|1801
Trafalgar|1805.8
Ulm|1805.79
Austerlitz|1805.92
Jena|1806|Jena-Auerstedt
Eylau|1807
Friedland|1807.4
Corunna|1809
Aspern-Essling|1809.4|Aspern
Wagram|1809.5
Talavera|1809.6
Salamanca|1812
Borodino|1812.7
Vitoria|1813
Leipzig|1813.8
Ligny|1815.45
Quatre Bras|1815.46
Waterloo|1815.47`);

  L('crusades', 3, 'Name a crusade.', 'when it set out', [1101, 1204], `
People's Crusade|1096|Peasants' Crusade
First Crusade|1096.5
Second Crusade|1147
Northern Crusades|1147.5|Baltic Crusades;Northern Crusade;Baltic Crusade
Third Crusade|1189
Fourth Crusade|1202
Albigensian Crusade|1209|Cathar Crusade
Children's Crusade|1212
Fifth Crusade|1217
Sixth Crusade|1228
Seventh Crusade|1248
Eighth Crusade|1270
Ninth Crusade|1271|Lord Edward's Crusade`);

  L('thirteen-colonies', 3, 'Name one of the Thirteen Colonies.', 'founding', [1630, 1664], `
Virginia|1607
Massachusetts|1620|Massachusetts Bay;Plymouth
New Hampshire|1623
New York|1624|New Netherland
Maryland|1632
Connecticut|1636
Rhode Island|1636.5
Delaware|1638
North Carolina|1653
South Carolina|1663
New Jersey|1664
Pennsylvania|1681
Georgia|1732`);

  L('german-chancellors', 3, 'Name a chancellor of Germany.', 'start of term', [1917.9, 1948], `
Otto von Bismarck|1871
Leo von Caprivi|1890
Chlodwig zu Hohenlohe-Schillingsfürst|1894|Hohenlohe
Bernhard von Bülow|1900
Theobald von Bethmann Hollweg|1909|Bethmann Hollweg;Bethmann-Hollweg
Georg Michaelis|1917
Georg von Hertling|1917.8
Max von Baden|1918|Prince Max of Baden
Friedrich Ebert|1918.8
Philipp Scheidemann|1919
Gustav Bauer|1919.5
Hermann Müller|1920
Constantin Fehrenbach|1920.5
Joseph Wirth|1921
Wilhelm Cuno|1922
Gustav Stresemann|1923
Wilhelm Marx|1923.9
Hans Luther|1925
Heinrich Brüning|1930
Franz von Papen|1932
Kurt von Schleicher|1932.9
Adolf Hitler|1933
Konrad Adenauer|1949
Ludwig Erhard|1963
Kurt Georg Kiesinger|1966
Willy Brandt|1969
Helmut Schmidt|1974
Helmut Kohl|1982
Gerhard Schröder|1998|Schroeder
Angela Merkel|2005
Olaf Scholz|2021
Friedrich Merz|2025`, 'P');

  L('civil-war-battles', 3, 'Name a battle of the American Civil War.', 'when it was fought', [1861.99, 1863.49], `
Fort Sumter|1861.28|Sumter
Bull Run|1861.55|Manassas;First Bull Run
Fort Donelson|1862.12
Hampton Roads|1862.19|Monitor and Merrimack
Shiloh|1862.27
Seven Days|1862.48|Seven Days Battles
Antietam|1862.71|Sharpsburg
Fredericksburg|1862.95
Stones River|1863|Murfreesboro
Chancellorsville|1863.33
Vicksburg|1863.38|Siege of Vicksburg
Gettysburg|1863.5
Chickamauga|1863.72
Chattanooga|1863.9
The Wilderness|1864.34
Spotsylvania|1864.36|Spotsylvania Court House
Cold Harbor|1864.42
Petersburg|1864.45|Siege of Petersburg
Atlanta|1864.56
Mobile Bay|1864.6
Franklin|1864.92
Nashville|1864.96
Appomattox|1865.27|Appomattox Court House`);

  L('moonwalkers', 3, 'Name someone who has walked on the Moon.', 'the Moon landing', [1969.6, 1971.2], `
Neil Armstrong|1969.55
Buzz Aldrin|1969.56|Edwin Aldrin
Pete Conrad|1969.88|Charles Conrad
Alan Bean|1969.89
Alan Shepard|1971.1
Edgar Mitchell|1971.11|Ed Mitchell
David Scott|1971.58|Dave Scott
James Irwin|1971.59|Jim Irwin
John Young|1972.3
Charles Duke|1972.31|Charlie Duke
Eugene Cernan|1972.94|Gene Cernan
Harrison Schmitt|1972.95|Jack Schmitt`, 'P');

  // ======================= more rolls =======================

  L('us-states', 1, 'Name a US state.', 'joining the Union', [1790.5, 1850.9], `
Delaware|1787.93
Pennsylvania|1787.95
New Jersey|1787.96
Georgia|1788.01
Connecticut|1788.02
Massachusetts|1788.1
Maryland|1788.32
South Carolina|1788.39|Carolina
New Hampshire|1788.47
Virginia|1788.48
New York|1788.57
North Carolina|1789.89|Carolina
Rhode Island|1790.41
Vermont|1791.17
Kentucky|1792
Tennessee|1796
Ohio|1803
Louisiana|1812
Indiana|1816
Mississippi|1817
Illinois|1818
Alabama|1819
Maine|1820
Missouri|1821
Arkansas|1836
Michigan|1837
Florida|1845.2
Texas|1845.99
Iowa|1846
Wisconsin|1848
California|1850
Minnesota|1858
Oregon|1859
Kansas|1861
West Virginia|1863
Nevada|1864
Nebraska|1867
Colorado|1876
North Dakota|1889.84|Dakota
South Dakota|1889.841|Dakota
Montana|1889.85
Washington|1889.86|Washington State
Idaho|1890.5
Wyoming|1890.52
Utah|1896
Oklahoma|1907
New Mexico|1912.02
Arizona|1912.12
Alaska|1959.01
Hawaii|1959.64`);

  L('elements', 1, 'Name a chemical element.', 'when it was discovered', [1700, 1810], `
Copper|~-9000
Lead|~-7000
Gold|~-40000
Silver|~-5000
Iron|~-5000.1
Carbon|~-26000
Tin|~-3500
Sulfur|~-2000|Sulphur;Brimstone
Mercury|~-1500|Quicksilver
Zinc|~-1000
Arsenic|~300
Antimony|~800
Bismuth|~1500
Phosphorus|1669
Cobalt|1735
Platinum|1748
Nickel|1751
Magnesium|1755
Hydrogen|1766
Nitrogen|1772
Barium|1772.5
Oxygen|1774
Chlorine|1774.1
Manganese|1774.2
Molybdenum|1778
Tellurium|1782
Tungsten|1783|Wolfram
Strontium|1787
Zirconium|1789
Uranium|1789.1
Titanium|1791
Yttrium|1794
Chromium|1797
Beryllium|1798
Vanadium|1801
Niobium|1801.1|Columbium
Tantalum|1802
Palladium|1802.5
Cerium|1803
Osmium|1803.1
Iridium|1803.2
Rhodium|1804
Potassium|1807
Sodium|1807.1
Calcium|1808
Boron|1808.1
Iodine|1811
Lithium|1817
Cadmium|1817.1
Selenium|1817.2
Silicon|1823
Aluminium|1825|Aluminum
Bromine|1825.5
Thorium|1829
Lanthanum|1838
Erbium|1843
Terbium|1843.1
Ruthenium|1844
Caesium|1860|Cesium
Rubidium|1861
Thallium|1861.1
Indium|1863
Helium|1868
Gallium|1875
Ytterbium|1878
Holmium|1878.1
Thulium|1879
Scandium|1879.1
Samarium|1879.2
Gadolinium|1880
Praseodymium|1885
Neodymium|1885.1
Germanium|1886
Fluorine|1886.1
Dysprosium|1886.2
Argon|1894
Europium|1896
Krypton|1898
Neon|1898.1
Xenon|1898.2
Polonium|1898.3
Radium|1898.4
Radon|1899
Actinium|1899.1
Lutetium|1906
Protactinium|1913
Hafnium|1922
Rhenium|1925
Technetium|1937
Francium|1939
Neptunium|1940
Astatine|1940.1
Plutonium|1940.2
Curium|1944
Americium|1944.1
Promethium|1945
Berkelium|1949
Californium|1950
Einsteinium|1952
Fermium|1952.1
Mendelevium|1955
Lawrencium|1961
Nobelium|1966
Rutherfordium|1969
Dubnium|1970
Seaborgium|1974
Bohrium|1981
Meitnerium|1982
Hassium|1984
Darmstadtium|1994
Roentgenium|1994.1
Copernicium|1996
Flerovium|1999
Livermorium|2000
Oganesson|2002
Moscovium|2003
Nihonium|2004
Tennessine|2010`);

  L('world-cup-hosts', 1, 'Name a country that has hosted the men\'s football World Cup.', 'the first it hosted', [1938, 1970], `
Uruguay|1930
Italy|1934
France|1938
Brazil|1950
Switzerland|1954
Sweden|1958
Chile|1962
England|1966
Mexico|1970
West Germany|1974|Germany
Argentina|1978
Spain|1982
United States|1994|USA;US;America;United States of America
South Korea|2002|Korea;Republic of Korea
Japan|2002.01
South Africa|2010
Russia|2018
Qatar|2022
Canada|2026`);

  L('emperors', 1, 'Name a famous emperor or empress.', 'start of reign', [0, 1000], `
Sargon of Akkad|~-2334|Sargon;Sargon the Great
Naram-Sin|~-2254|Naram Sin
Cyrus the Great|-559|Cyrus;Cyrus II
Darius the Great|-522|Darius;Darius I
Xerxes|-486|Xerxes I;Xerxes the Great
Chandragupta Maurya|~-321|Chandragupta
Ashoka|~-268|Asoka;Ashoka the Great
Qin Shi Huang|-221|Shi Huangdi;Qin Shi Huangdi;First Emperor
Liu Bang|-202|Gaozu;Gaozu of Han;Emperor Gaozu
Emperor Wu of Han|-141|Wu of Han;Han Wudi;Wudi
Augustus|-27|Octavian;Caesar Augustus
Tiberius|14
Caligula|37
Claudius|41
Nero|54
Vespasian|69
Titus|79
Domitian|81
Nerva|96
Trajan|98
Hadrian|117
Antoninus Pius|138
Marcus Aurelius|161
Commodus|180
Septimius Severus|193
Caracalla|211
Elagabalus|218|Heliogabalus
Aurelian|270
Diocletian|284
Constantine the Great|306|Constantine;Constantine I
Julian|361|Julian the Apostate
Theodosius|379|Theodosius I;Theodosius the Great
Honorius|393
Romulus Augustulus|475|Romulus Augustus
Justinian|527|Justinian I;Justinian the Great
Heraclius|610
Taizong of Tang|626|Tang Taizong;Emperor Taizong
Wu Zetian|690|Empress Wu
Leo the Isaurian|717|Leo III
Irene of Athens|797|Irene;Empress Irene
Charlemagne|800|Charles the Great
Otto the Great|962|Otto I
Basil II|976|Basil the Bulgar Slayer
Alexios I Komnenos|1081|Alexius Comnenus;Alexios Komnenos;Alexius I
Frederick Barbarossa|1155|Barbarossa;Frederick I
Genghis Khan|1206|Chinggis Khan;Jenghiz Khan;Temujin;Genghis
Frederick II|1220
Kublai Khan|1260|Kubilai Khan;Khubilai Khan;Kublai
Mansa Musa|1312|Musa I
Hongwu|1368|Zhu Yuanzhang;Hongwu Emperor
Yongle|1402|Yongle Emperor
Pachacuti|1438
Constantine XI|1449|Constantine XI Palaiologos;Constantine Palaiologos
Huayna Capac|1493
Montezuma|1502|Moctezuma;Montezuma II;Moctezuma II
Charles V|1519
Babur|1526
Atahualpa|1532|Atahuallpa
Akbar|1556|Akbar the Great
Jahangir|1605
Shah Jahan|1628
Aurangzeb|1658
Kangxi|1661|Kangxi Emperor
Peter the Great|1682|Peter I
Qianlong|1735|Qianlong Emperor
Maria Theresa|1740
Elizabeth of Russia|1741|Empress Elizabeth
Catherine the Great|1762|Catherine II
Joseph II|1765
Alexander I|1801
Napoleon|1804|Napoleon Bonaparte;Napoleon I;Bonaparte
Pedro I|1822|Dom Pedro I
Nicholas I|1825
Pedro II|1831|Dom Pedro II
Victoria|1837|Queen Victoria
Franz Joseph|1848|Franz Joseph I;Francis Joseph
Napoleon III|1852|Louis-Napoleon;Louis Napoleon
Alexander II|1855
Cixi|1861|Empress Dowager Cixi;Tzu Hsi
Maximilian of Mexico|1864|Maximilian I of Mexico;Maximilian
Meiji|1867|Mutsuhito;Emperor Meiji
Wilhelm I|1871|William I;Kaiser Wilhelm I
Guangxu|1875|Guangxu Emperor
Alexander III|1881
Wilhelm II|1888|William II;Kaiser Wilhelm II;Kaiser Wilhelm;Kaiser Bill
Menelik II|1889|Menelik
Nicholas II|1894
Puyi|1908|Pu Yi;Xuantong
Taisho|1912|Yoshihito;Emperor Taisho
Charles I of Austria|1916|Karl I;Karl of Austria
Hirohito|1926|Showa;Emperor Showa
Haile Selassie|1930|Ras Tafari
Mohammad Reza Pahlavi|1941|Shah of Iran;Reza Pahlavi;The Shah
Bokassa|1976|Jean-Bedel Bokassa;Bokassa I
Akihito|1989
Naruhito|2019`);

  L('us-wars', 1, 'Name a war the United States has fought in.', 'when it began', [1815.5, 1918], `
American Revolutionary War|1775|Revolutionary War;War of Independence;American Revolution;American War of Independence
Northwest Indian War|1785
Quasi-War|1798|Quasi War
First Barbary War|1801|Tripolitan War;Barbary War;Barbary Wars
War of 1812|1812|1812
Second Barbary War|1815|Algerine War;Barbary War;Barbary Wars
First Seminole War|1817|Seminole War;Seminole Wars
Black Hawk War|1832
Second Seminole War|1835|Seminole War;Seminole Wars
Mexican-American War|1846|Mexican War
Civil War|1861|American Civil War
Great Sioux War|1876|Sioux War;Black Hills War
Spanish-American War|1898
Philippine-American War|1899|Philippine War
Boxer Rebellion|1899.9|Boxer Uprising
World War I|1914|First World War;WWI;WW1;Great War;World War One
World War II|1939|Second World War;WWII;WW2;World War Two
Cold War|1947
Korean War|1950|Korea
Vietnam War|1955
Invasion of Grenada|1983|Grenada
Invasion of Panama|1989|Panama
Gulf War|1990|Persian Gulf War;First Gulf War;Desert Storm
Somali Civil War|1991|Somalia
Bosnian War|1992|Bosnia
Kosovo War|1998|Kosovo
War in Afghanistan|2001|Afghanistan;Afghan War
War on Terror|2001.7
Iraq War|2003|Second Gulf War;Iraq
War against the Islamic State|2014|ISIS;Islamic State;War against ISIS`);

  L('board-games', 1, 'Name a board game or tabletop game.', 'when it first appeared', [1000, 1900], `
Senet|~-3100
Mehen|~-3000
Royal Game of Ur|~-2600|Game of Ur;Ur
Nine Men's Morris|~-1400|Merels;Mill
Go|~-500|Weiqi;Baduk
Hnefatafl|~400|Tafl;Viking chess
Pachisi|~500|Parcheesi
Backgammon|~600|Nard;Tables
Mancala|~650|Oware;Kalah
Chess|~600.5|Chaturanga
Xiangqi|~800|Chinese chess
Playing cards|~850|Cards
Shogi|~1100|Japanese chess
Draughts|~1100.5|Checkers
Dominoes|~1120
Snakes and Ladders|~1200|Chutes and Ladders
Tarot|~1440
Mahjong|~1850
The Game of Life|1860|Game of Life;Life
Othello|1883|Reversi
Chinese checkers|1892
Ludo|1896
The Landlord's Game|1904|Landlords Game
Sorry!|1929|Sorry
Battleship|1931|Battleships
Monopoly|1935
Scrabble|1938
Stratego|1946
Cluedo|1949|Clue
Candy Land|1949.5|Candyland
Yahtzee|1956
Risk|1957
Diplomacy|1959
Mouse Trap|1963|Mousetrap
Operation|1965
Twister|1966
Kerplunk|1967
Mastermind|1970
Uno|1971
Boggle|1972
Connect Four|1974|Connect 4
Dungeons & Dragons|1974.1|D&D;DnD;Dungeons and Dragons
Hungry Hungry Hippos|1978|Hungry Hippos
Guess Who?|1979|Guess Who
Trivial Pursuit|1981
Axis & Allies|1981.5|Axis and Allies
Jenga|1983
Warhammer|1983.5
Pictionary|1985
Scattergories|1988
Taboo|1989
Magic: The Gathering|1993|Magic the Gathering;Magic;MTG
Catan|1995|Settlers of Catan;The Settlers of Catan
Cranium|1998
Carcassonne|2000
Ticket to Ride|2004
Agricola|2007
Pandemic|2008
Dominion|2008.1
Dixit|2008.2
7 Wonders|2010|Seven Wonders
Cards Against Humanity|2011
Codenames|2015
Exploding Kittens|2015.1
Terraforming Mars|2016
Gloomhaven|2017
Azul|2017.1
Wingspan|2019`);

  L('aeroplanes', 2, 'Name a famous aeroplane.', 'first flight', [1919, 1945.5], `
Wright Flyer|1903|Kitty Hawk;Flyer;Wright brothers plane
Santos-Dumont 14-bis|1906|14-bis;14 bis
Bleriot XI|1909|Bleriot
Sopwith Pup|1916
Sopwith Camel|1916.9|Camel
Fokker Dr.I|1917|Fokker triplane;Fokker Dr1;Red Baron's triplane
SPAD XIII|1917.3|SPAD;SPAD S.XIII
Vickers Vimy|1917.9|Vimy
Fokker D.VII|1918|Fokker D7
Ford Trimotor|1926|Tin Goose
Spirit of St. Louis|1927
Lockheed Vega|1927.5|Vega
Junkers Ju 52|1930|Ju 52;Ju52
Tiger Moth|1931|de Havilland Tiger Moth
Boeing 247|1933|247
Lockheed Electra|1934|Electra
Messerschmitt Bf 109|1935.4|Bf 109;Me 109;Messerschmitt 109;Bf109;Me109
Boeing B-17 Flying Fortress|1935.55|B-17;B17;Flying Fortress
Junkers Ju 87|1935.7|Stuka;Ju 87;Ju87
Hawker Hurricane|1935.85|Hurricane
Douglas DC-3|1935.95|DC-3;DC3;Dakota;C-47
Supermarine Spitfire|1936|Spitfire
Short Sunderland|1937|Sunderland
Mitsubishi Zero|1939|Zero;A6M Zero;Mitsubishi A6M
Consolidated B-24 Liberator|1939.99|B-24;B24;Liberator
P-51 Mustang|1940.8|Mustang;P51;North American P-51 Mustang
de Havilland Mosquito|1940.9|Mosquito
Avro Lancaster|1941|Lancaster
Messerschmitt Me 262|1941.3|Me 262;Me262
Boeing B-29 Superfortress|1942.7|B-29;B29;Superfortress
Gloster Meteor|1943|Meteor
Enola Gay|1945
Bell X-1|1946|X-1;X1
F-86 Sabre|1947.75|Sabre;F86
Spruce Goose|1947.85|Hughes H-4 Hercules
MiG-15|1947.99|MiG 15;MiG15
de Havilland Comet|1949|Comet
English Electric Canberra|1949.4|Canberra
Boeing B-52 Stratofortress|1952|B-52;B52;Stratofortress
Avro Vulcan|1952.6|Vulcan
C-130 Hercules|1954|Hercules;C130;Lockheed C-130 Hercules
Lockheed U-2|1955|U-2;U2
MiG-21|1955.1|MiG 21;MiG21
Cessna 172|1955.5|Cessna
Boeing 707|1957|707
F-4 Phantom|1958|Phantom;F4 Phantom;F-4 Phantom II;F4
Lockheed SR-71 Blackbird|1964|SR-71;SR71;Blackbird
Boeing 737|1967|737
Hawker Siddeley Harrier|1967.9|Harrier;Harrier jump jet
Tupolev Tu-144|1968.99|Tu-144;Tu144;Concordski
Boeing 747|1969.1|747;Jumbo jet;Jumbo
Concorde|1969.17|Concord
F-14 Tomcat|1970|Tomcat;F14;F-14
Airbus A300|1972|A300
A-10 Thunderbolt II|1972.4|A-10;A10;Warthog;A-10 Warthog
F-15 Eagle|1972.5|F15;F-15
F-16 Fighting Falcon|1974|F-16;F16
Panavia Tornado|1974.6|Tornado
F/A-18 Hornet|1978|F-18;F18;Hornet
F-117 Nighthawk|1981|F-117;F117;Stealth fighter;Nighthawk
Airbus A320|1987|A320
Antonov An-225|1988|An-225;An225;Mriya
B-2 Spirit|1989|B-2;B2;Stealth bomber
Eurofighter Typhoon|1994|Typhoon;Eurofighter
Boeing 777|1994.5|777
F-22 Raptor|1997|F-22;F22;Raptor
Airbus A380|2005|A380
F-35 Lightning II|2006|F-35;F35
Boeing 787 Dreamliner|2009|787;Dreamliner`);

  L('naval-battles', 2, 'Name a famous naval battle.', 'when it was fought', [1500, 1815], `
Alashiya|~-1210|Battle of Alashiya;Cyprus
Battle of the Delta|~-1175|Delta;Nile Delta
Artemisium|-480.1
Salamis|-480
Arginusae|-406
Aegospotami|-405
Mylae|-260
Cape Ecnomus|-256|Ecnomus
Aegates Islands|-241|Aegates
Actium|-31
Red Cliffs|208|Chibi
Battle of the Masts|655|Masts
Svolder|1000|Svold
Sluys|1340
Lepanto|1571
Spanish Armada|1588|Armada;Gravelines
Hansan Island|1592|Hansando;Hansan
Myeongnyang|1597
Noryang|1598
The Downs|1639|Downs
Lowestoft|1665
Four Days' Battle|1666|Four Days
Raid on the Medway|1667|Medway
Solebay|1672
Texel|1673
Beachy Head|1690
La Hogue|1692|Barfleur;La Hougue
Vigo Bay|1702
Cape Passaro|1718
Lagos|1759.6
Quiberon Bay|1759.9
Chesapeake|1781|Virginia Capes;Chesapeake Bay
The Saintes|1782|Saintes
Glorious First of June|1794|First of June
Cape St Vincent|1797|Cape Saint Vincent;St Vincent
Camperdown|1797.8
The Nile|1798|Nile;Aboukir Bay
Copenhagen|1801
Trafalgar|1805
Lake Erie|1813
Navarino|1827
Sinop|1853
Hampton Roads|1862|Monitor and Merrimack
Mobile Bay|1864
Yalu River|1894|Yalu
Manila Bay|1898
Santiago de Cuba|1898.5|Santiago
Tsushima|1905
Heligoland Bight|1914.65
Coronel|1914.84
Falkland Islands|1914.93|Falklands
Dogger Bank|1915
Jutland|1916
Atlantic|1939.67|Battle of the Atlantic
River Plate|1939.95
Taranto|1940
Cape Matapan|1941.24|Matapan
Denmark Strait|1941.39|Sinking of the Bismarck
Pearl Harbor|1941.93
Java Sea|1942.15
Coral Sea|1942.35
Midway|1942.43
Savo Island|1942.6
Guadalcanal|1942.87
Barents Sea|1942.99
North Cape|1943.98
Philippine Sea|1944.47
Leyte Gulf|1944.81|Leyte`);

  L('french-presidents', 2, 'Name a president of France.', 'start of term', [1899, 1958], `
Louis-Napoleon Bonaparte|1848|Napoleon III;Louis Napoleon;Louis-Napoleon
Adolphe Thiers|1871
Patrice de MacMahon|1873|MacMahon;Mac-Mahon
Jules Grevy|1879
Sadi Carnot|1887
Jean Casimir-Perier|1894|Casimir-Perier;Casimir Perier
Felix Faure|1895
Emile Loubet|1899
Armand Fallieres|1906
Raymond Poincare|1913
Paul Deschanel|1920.1
Alexandre Millerand|1920.7
Gaston Doumergue|1924
Paul Doumer|1931
Albert Lebrun|1932
Vincent Auriol|1947
Rene Coty|1954
Charles de Gaulle|1959|de Gaulle
Georges Pompidou|1969
Valery Giscard d'Estaing|1974|Giscard;Giscard d'Estaing;VGE
Francois Mitterrand|1981
Jacques Chirac|1995
Nicolas Sarkozy|2007
Francois Hollande|2012
Emmanuel Macron|2017`, 'P');

  L('nobel-peace', 2, 'Name a winner of the Nobel Peace Prize.', 'the year of the prize', [1919, 1964], `
Henry Dunant|1901|Dunant;Henri Dunant
Frederic Passy|1901|Passy
Elie Ducommun|1902|Ducommun
Charles Albert Gobat|1902|Gobat;Albert Gobat
Randal Cremer|1903|Cremer;William Randal Cremer
Institute of International Law|1904|Institut de Droit International
Bertha von Suttner|1905|Suttner;von Suttner
Theodore Roosevelt|1906|Teddy Roosevelt;Roosevelt
Ernesto Moneta|1907|Moneta;Ernesto Teodoro Moneta
Louis Renault|1907|Renault
Klas Pontus Arnoldson|1908|Arnoldson
Fredrik Bajer|1908|Bajer
Auguste Beernaert|1909|Beernaert
Paul d'Estournelles de Constant|1909|d'Estournelles de Constant;Estournelles de Constant
Permanent International Peace Bureau|1910|International Peace Bureau;Peace Bureau
Tobias Asser|1911|Asser
Alfred Fried|1911|Fried
Elihu Root|1912|Root
Henri La Fontaine|1913|La Fontaine
Red Cross|1917|International Committee of the Red Cross;ICRC;International Red Cross
Woodrow Wilson|1919|Wilson
Leon Bourgeois|1920|Bourgeois
Hjalmar Branting|1921|Branting
Christian Lange|1921|Lange
Fridtjof Nansen|1922|Nansen
Austen Chamberlain|1925|Chamberlain
Charles Dawes|1925|Dawes
Aristide Briand|1926|Briand
Gustav Stresemann|1926|Stresemann
Ferdinand Buisson|1927|Buisson
Ludwig Quidde|1927|Quidde
Frank Kellogg|1929|Kellogg
Nathan Soderblom|1930|Soderblom
Jane Addams|1931|Addams
Nicholas Murray Butler|1931|Butler
Norman Angell|1933|Angell
Arthur Henderson|1934|Henderson
Carl von Ossietzky|1935|Ossietzky
Carlos Saavedra Lamas|1936|Saavedra Lamas
Robert Cecil|1937|Cecil;Lord Cecil;Viscount Cecil
Nansen International Office for Refugees|1938|Nansen Office
Cordell Hull|1945|Hull
Emily Greene Balch|1946|Balch;Emily Balch
John Mott|1946|Mott
Quakers|1947|Friends Service Council;American Friends Service Committee
John Boyd Orr|1949|Boyd Orr
Ralph Bunche|1950|Bunche
Leon Jouhaux|1951|Jouhaux
Albert Schweitzer|1952|Schweitzer
George Marshall|1953|Marshall;George C. Marshall
UNHCR|1954|UN Refugee Agency;United Nations High Commissioner for Refugees
Lester Pearson|1957|Pearson;Lester B. Pearson
Georges Pire|1958|Pire;Dominique Pire
Philip Noel-Baker|1959|Noel-Baker
Albert Luthuli|1960|Luthuli;Albert Lutuli
Dag Hammarskjold|1961|Hammarskjold
Linus Pauling|1962|Pauling
Martin Luther King|1964|MLK;Martin Luther King Jr;King
UNICEF|1965
Rene Cassin|1968|Cassin
International Labour Organization|1969|ILO
Norman Borlaug|1970|Borlaug
Willy Brandt|1971|Brandt
Henry Kissinger|1973|Kissinger
Le Duc Tho|1973
Sean MacBride|1974|MacBride
Eisaku Sato|1974|Sato
Andrei Sakharov|1975|Sakharov
Betty Williams|1976|Williams
Mairead Corrigan|1976|Corrigan;Mairead Maguire
Amnesty International|1977|Amnesty
Anwar Sadat|1978|Sadat
Menachem Begin|1978|Begin
Mother Teresa|1979|Teresa of Calcutta;Saint Teresa;Teresa
Adolfo Perez Esquivel|1980|Perez Esquivel
Alva Myrdal|1982|Myrdal
Alfonso Garcia Robles|1982|Garcia Robles
Lech Walesa|1983|Walesa
Desmond Tutu|1984|Tutu
International Physicians for the Prevention of Nuclear War|1985|IPPNW
Elie Wiesel|1986|Wiesel
Oscar Arias|1987|Arias
UN Peacekeeping Forces|1988|UN Peacekeepers;Peacekeepers;Blue Helmets
Dalai Lama|1989|Tenzin Gyatso
Mikhail Gorbachev|1990|Gorbachev
Aung San Suu Kyi|1991|Suu Kyi
Rigoberta Menchu|1992|Menchu
Nelson Mandela|1993|Mandela
F. W. de Klerk|1993|de Klerk;FW de Klerk
Yasser Arafat|1994|Arafat
Shimon Peres|1994|Peres
Yitzhak Rabin|1994|Rabin
Joseph Rotblat|1995|Rotblat
Pugwash Conferences|1995|Pugwash
Carlos Belo|1996|Belo;Bishop Belo
Jose Ramos-Horta|1996|Ramos-Horta;Ramos Horta
Jody Williams|1997|Williams
International Campaign to Ban Landmines|1997|ICBL
John Hume|1998|Hume
David Trimble|1998|Trimble
Medecins Sans Frontieres|1999|Doctors Without Borders;MSF
Kim Dae-jung|2000|Kim Dae Jung
Kofi Annan|2001|Annan
United Nations|2001|UN
Jimmy Carter|2002|Carter
Shirin Ebadi|2003|Ebadi
Wangari Maathai|2004|Maathai
Mohamed ElBaradei|2005|ElBaradei
IAEA|2005|International Atomic Energy Agency
Muhammad Yunus|2006|Yunus
Grameen Bank|2006|Grameen
Al Gore|2007|Gore
IPCC|2007|Intergovernmental Panel on Climate Change
Martti Ahtisaari|2008|Ahtisaari
Barack Obama|2009|Obama
Liu Xiaobo|2010
Ellen Johnson Sirleaf|2011|Sirleaf;Johnson Sirleaf
Leymah Gbowee|2011|Gbowee
Tawakkol Karman|2011|Karman
European Union|2012|EU
OPCW|2013|Organisation for the Prohibition of Chemical Weapons
Malala Yousafzai|2014|Malala
Kailash Satyarthi|2014|Satyarthi
Tunisian National Dialogue Quartet|2015|Tunisian Quartet;National Dialogue Quartet
Juan Manuel Santos|2016|Santos
ICAN|2017|International Campaign to Abolish Nuclear Weapons
Denis Mukwege|2018|Mukwege
Nadia Murad|2018|Murad
Abiy Ahmed|2019|Abiy
World Food Programme|2020|WFP;World Food Program
Maria Ressa|2021|Ressa
Dmitry Muratov|2021|Muratov
Ales Bialiatski|2022|Bialiatski
Memorial|2022
Center for Civil Liberties|2022|Centre for Civil Liberties
Narges Mohammadi|2023|Mohammadi
Nihon Hidankyo|2024|Hidankyo
Maria Corina Machado|2025|Machado
Navi Pillay|2026|Pillay;Navanethem Pillay`);

  L('mathematicians', 2, 'Name a famous mathematician.', 'birth', [0, 1600], `
Ahmes|~-1680|Ahmose
Thales|~-624
Pythagoras|~-570
Zeno of Elea|~-490|Zeno
Hippocrates of Chios|~-470
Eudoxus|~-408|Eudoxus of Cnidus
Euclid|~-325
Archimedes|~-287
Eratosthenes|~-276
Apollonius of Perga|~-262|Apollonius
Hipparchus|~-190
Hero of Alexandria|~10|Hero;Heron
Ptolemy|~100
Diophantus|~200
Pappus|~290|Pappus of Alexandria
Hypatia|~360
Aryabhata|476
Brahmagupta|598
Al-Khwarizmi|~780|Khwarizmi;Muhammad ibn Musa al-Khwarizmi
Omar Khayyam|1048|Khayyam
Bhaskara II|1114|Bhaskara
Fibonacci|~1170|Leonardo of Pisa;Leonardo Fibonacci
Regiomontanus|1436
Luca Pacioli|~1447|Pacioli
Niccolo Tartaglia|~1499|Tartaglia
Gerolamo Cardano|1501|Cardano;Cardan
Francois Viete|1540|Viete;Vieta
John Napier|1550|Napier
Johannes Kepler|1571|Kepler
Rene Descartes|1596|Descartes
Pierre de Fermat|1607|Fermat
Blaise Pascal|1623|Pascal
Christiaan Huygens|1629|Huygens
Isaac Newton|1643|Newton
Gottfried Leibniz|1646|Leibniz;Gottfried Wilhelm Leibniz
Jacob Bernoulli|1655
Johann Bernoulli|1667
Daniel Bernoulli|1700
Leonhard Euler|1707|Euler
Jean le Rond d'Alembert|1717|d'Alembert;Alembert
Maria Gaetana Agnesi|1718|Agnesi;Maria Agnesi
Joseph-Louis Lagrange|1736|Lagrange
Pierre-Simon Laplace|1749|Laplace
Adrien-Marie Legendre|1752|Legendre
Joseph Fourier|1768|Fourier
Sophie Germain|1776|Germain
Carl Friedrich Gauss|1777|Gauss
Augustin-Louis Cauchy|1789|Cauchy
August Mobius|1790|Mobius;Moebius
Charles Babbage|1791|Babbage
Nikolai Lobachevsky|1792|Lobachevsky
Niels Henrik Abel|1802|Abel
Carl Jacobi|1804|Jacobi
William Rowan Hamilton|1805|Hamilton
Augustus De Morgan|1806|De Morgan
Evariste Galois|1811|Galois
Karl Weierstrass|1815.7|Weierstrass
George Boole|1815.8|Boole
Ada Lovelace|1815.9|Lovelace;Ada Byron
Pafnuty Chebyshev|1821|Chebyshev
Arthur Cayley|1821.6|Cayley
Bernhard Riemann|1826|Riemann
Richard Dedekind|1831|Dedekind
Lewis Carroll|1832|Charles Dodgson;Dodgson
John Venn|1834|Venn
Georg Cantor|1845|Cantor
Felix Klein|1849|Klein
Sofia Kovalevskaya|1850|Kovalevskaya;Sofya Kovalevskaya
Henri Poincare|1854|Poincare
Giuseppe Peano|1858|Peano
David Hilbert|1862|Hilbert
Bertrand Russell|1872|Russell
G. H. Hardy|1877|Hardy;Godfrey Hardy
Emmy Noether|1882|Noether
Srinivasa Ramanujan|1887|Ramanujan
Andrey Kolmogorov|1903.3|Kolmogorov
John von Neumann|1903.99|von Neumann;Neumann
Kurt Godel|1906|Godel;Goedel
Alan Turing|1912|Turing
Paul Erdos|1913|Erdos
Claude Shannon|1916|Shannon
Katherine Johnson|1918
Benoit Mandelbrot|1924|Mandelbrot
Alexander Grothendieck|1928.2|Grothendieck
John Nash|1928.5|Nash
Roger Penrose|1931|Penrose
John Conway|1937|Conway;John Horton Conway
Andrew Wiles|1953|Wiles
Grigori Perelman|1966|Perelman
Terence Tao|1975|Tao;Terry Tao
Maryam Mirzakhani|1977|Mirzakhani`, 'P');

  L('architects', 2, 'Name a famous architect.', 'birth', [1400, 1800], `
Imhotep|~-2650
Senenmut|~-1500|Senmut
Ictinus|~-480|Iktinos
Callicrates|~-470|Kallikrates
Vitruvius|~-80
Apollodorus of Damascus|~60|Apollodorus
Isidore of Miletus|~442|Isidore
Anthemius of Tralles|~474|Anthemius
Arnolfo di Cambio|~1240|Arnolfo
Filippo Brunelleschi|1377|Brunelleschi
Leon Battista Alberti|1404|Alberti
Donato Bramante|1444|Bramante
Michelangelo|1475
Mimar Sinan|~1489|Sinan
Andrea Palladio|1508|Palladio
Giorgio Vasari|1511|Vasari
Inigo Jones|1573
Gian Lorenzo Bernini|1598.9|Bernini
Francois Mansart|1598|Mansart
Francesco Borromini|1599|Borromini
Louis Le Vau|1612|Le Vau
Christopher Wren|1632|Wren;Sir Christopher Wren
Jules Hardouin-Mansart|1646|Hardouin-Mansart
Nicholas Hawksmoor|~1661|Hawksmoor
John Vanbrugh|1664|Vanbrugh
James Gibbs|1682|Gibbs
William Kent|~1685|Kent
Capability Brown|1716|Lancelot Brown;Lancelot Capability Brown
Robert Adam|1728
Thomas Jefferson|1743|Jefferson
John Nash|1752|Nash
John Soane|1753|Soane;Sir John Soane
Pierre L'Enfant|1754|L'Enfant;Pierre Charles L'Enfant
Benjamin Latrobe|1764|Latrobe
Karl Friedrich Schinkel|1781|Schinkel
Charles Barry|1795|Barry
Joseph Paxton|1803|Paxton
Baron Haussmann|1809|Haussmann;Georges-Eugene Haussmann
George Gilbert Scott|1811|Gilbert Scott
Augustus Pugin|1812|Pugin
Eugene Viollet-le-Duc|1814|Viollet-le-Duc
Frederick Law Olmsted|1822|Olmsted
Charles Garnier|1825|Garnier
Gustave Eiffel|1832|Eiffel
Daniel Burnham|1846|Burnham
Antoni Gaudi|1852|Gaudi
Louis Sullivan|1856|Sullivan
Victor Horta|1861|Horta
Frank Lloyd Wright|1867|Lloyd Wright
Charles Rennie Mackintosh|1868|Mackintosh
Edwin Lutyens|1869|Lutyens
Adolf Loos|1870|Loos
Walter Gropius|1883|Gropius
Ludwig Mies van der Rohe|1886|Mies van der Rohe;Mies
Le Corbusier|1887|Corbusier
Buckminster Fuller|1895|Fuller
Alvar Aalto|1898|Aalto
Louis Kahn|1901|Kahn
Albert Speer|1905|Speer
Philip Johnson|1906
Oscar Niemeyer|1907|Niemeyer
Eero Saarinen|1910|Saarinen
Kenzo Tange|1913|Tange
I. M. Pei|1917|Pei;IM Pei;Ieoh Ming Pei
Jorn Utzon|1918|Utzon
Frank Gehry|1929|Gehry
Richard Rogers|1933
Norman Foster|1935|Foster;Lord Foster
Renzo Piano|1937|Piano
Tadao Ando|1941|Ando
Rem Koolhaas|1944|Koolhaas
Daniel Libeskind|1946|Libeskind
Zaha Hadid|1950|Hadid
Santiago Calatrava|1951|Calatrava
Bjarke Ingels|1974|Ingels`, 'P');

  L('holy-roman-emperors', 3, 'Name a Holy Roman Emperor.', 'start of reign as emperor', [1000, 1500], `
Charlemagne|800|Charles the Great;Charles I
Louis the Pious|814|Louis I
Lothair I|840
Louis II|855|Louis II of Italy
Charles the Bald|875|Charles II
Charles the Fat|881|Charles III
Arnulf of Carinthia|896|Arnulf
Louis the Blind|901|Louis III
Berengar|915|Berengar I;Berengar of Friuli
Otto the Great|962|Otto I
Otto II|973
Otto III|996
Henry II|1014
Conrad II|1027
Henry III|1046
Henry IV|1084
Henry V|1111
Lothair III|1133
Frederick Barbarossa|1155|Barbarossa;Frederick I
Henry VI|1191
Otto IV|1209
Frederick II|1220
Henry VII|1312
Louis the Bavarian|1328|Louis IV
Charles IV|1355
Sigismund|1433
Frederick III|1452
Maximilian I|1508
Charles V|1519
Ferdinand I|1556
Maximilian II|1564
Rudolf II|1576
Matthias|1612
Ferdinand II|1619
Ferdinand III|1637
Leopold I|1658
Joseph I|1705
Charles VI|1711
Charles VII|1742
Francis I|1745
Joseph II|1765
Leopold II|1790
Francis II|1792`);

  L('scottish-monarchs', 3, 'Name a king or queen of Scots from before 1603.', 'start of reign', [1004, 1306], `
Kenneth MacAlpin|843|Kenneth I;Kenneth mac Alpin
Donald I|858
Constantine I|862
Aed|877
Giric|878
Donald II|889
Constantine II|900
Malcolm I|943
Indulf|954
Dub|962|Duff
Cuilen|967|Culen
Kenneth II|971
Constantine III|995
Kenneth III|997
Malcolm II|1005
Duncan I|1034
Macbeth|1040
Lulach|1057
Malcolm III|1058|Malcolm Canmore
Donald III|1093|Donald Bane;Donalbain
Duncan II|1094
Edgar|1097
Alexander I|1107
David I|1124
Malcolm IV|1153
William the Lion|1165|William I
Alexander II|1214
Alexander III|1249
Margaret, Maid of Norway|1286|Maid of Norway;Margaret
John Balliol|1292|Balliol
Robert the Bruce|1306|Robert I;Robert Bruce;The Bruce
David II|1329
Robert II|1371
Robert III|1390
James I|1406
James II|1437
James III|1460
James IV|1488
James V|1513
Mary, Queen of Scots|1542|Mary Queen of Scots;Mary Stuart;Mary I;Mary
James VI|1567`);

  L('caliphates', 3, 'Name a caliphate or Muslim dynasty.', 'founding', [750, 1100], `
Rashidun|632|Rashidun Caliphate
Umayyad|661|Umayyad Caliphate;Umayyads
Abbasid|750|Abbasid Caliphate;Abbasids
Cordoba|756|Emirate of Cordoba;Caliphate of Cordoba
Idrisid|788|Idrisids
Aghlabid|800|Aghlabids
Samanid|819|Samanids
Tahirid|821|Tahirids
Saffarid|861|Saffarids
Tulunid|868|Tulunids
Fatimid|909|Fatimid Caliphate;Fatimids
Buyid|934|Buyids;Buwayhid
Ghaznavid|977|Ghaznavids
Seljuk|1037|Seljuks;Seljuq;Great Seljuk
Almoravid|1040|Almoravids
Almohad|1121|Almohads;Almohad Caliphate
Zengid|1127|Zengids
Ayyubid|1171|Ayyubids
Delhi Sultanate|1206|Delhi
Hafsid|1229|Hafsids
Nasrid|1232|Nasrids
Marinid|1244|Marinids
Mamluk|1250|Mamluks;Mamluk Sultanate
Ottoman|1299|Ottomans;Ottoman Caliphate
Timurid|1370|Timurids
Safavid|1501|Safavids
Mughal|1526|Mughals;Moghul
Saadi|1549|Saadian;Saadians
Alaouite|1631|Alawite;Alawi
Afsharid|1736|Afsharids
Zand|1751
Qajar|1789|Qajars
Sokoto|1804|Sokoto Caliphate`);

  L('roses-battles', 3, 'Name a battle of the Wars of the Roses.', 'when it was fought', [1460.6, 1464.9], `
First St Albans|1455.4|First Battle of St Albans;St Albans
Blore Heath|1459.73
Ludford Bridge|1459.78|Ludford
Northampton|1460.52
Wakefield|1460.99
Mortimer's Cross|1461.09
Second St Albans|1461.13|Second Battle of St Albans;St Albans
Ferrybridge|1461.24
Towton|1461.245
Hedgeley Moor|1464.3
Hexham|1464.37
Edgecote|1469.56|Edgecote Moor;Edgcote
Losecoat Field|1470.2|Empingham;Losecote Field
Barnet|1471.28
Tewkesbury|1471.34
Bosworth|1485.64|Bosworth Field
Stoke Field|1487.45|Stoke;East Stoke`);

  L('revolutionary-war-battles', 3, 'Name a battle of the American Revolutionary War.', 'when it was fought', [1775.999, 1777.999], `
Lexington and Concord|1775.3|Lexington;Concord
Fort Ticonderoga|1775.36|Ticonderoga
Bunker Hill|1775.46|Breed's Hill
Quebec|1775.99
Moore's Creek Bridge|1776.16|Moores Creek
Sullivan's Island|1776.49|Fort Moultrie
Long Island|1776.65|Brooklyn;Brooklyn Heights
Harlem Heights|1776.71
Valcour Island|1776.78
White Plains|1776.82
Fort Washington|1776.87
Trenton|1776.98
Princeton|1777.01
Oriskany|1777.6
Bennington|1777.62
Brandywine|1777.7
Saratoga|1777.72|Freeman's Farm;Bemis Heights
Germantown|1777.76
Monmouth|1778.49|Monmouth Court House
Savannah|1778.99
Vincennes|1779.15
Stony Point|1779.54
Flamborough Head|1779.73
Charleston|1780.3
Camden|1780.62
Kings Mountain|1780.77|King's Mountain
Cowpens|1781.05
Guilford Court House|1781.2|Guilford Courthouse
Chesapeake|1781.68|Virginia Capes
Eutaw Springs|1781.69
Yorktown|1781.75`);

  L('indian-pms', 3, 'Name a prime minister of India.', 'start of first term', [1966, 1991], `
Jawaharlal Nehru|1947|Nehru;Pandit Nehru
Gulzarilal Nanda|1964.4|Nanda
Lal Bahadur Shastri|1964.44|Shastri
Indira Gandhi|1966
Morarji Desai|1977|Desai
Charan Singh|1979
Rajiv Gandhi|1984
V. P. Singh|1989|Vishwanath Pratap Singh;VP Singh
Chandra Shekhar|1990
P. V. Narasimha Rao|1991|Narasimha Rao;Rao;PV Narasimha Rao
Atal Bihari Vajpayee|1996.4|Vajpayee
H. D. Deve Gowda|1996.45|Deve Gowda;Gowda
I. K. Gujral|1997|Gujral;Inder Kumar Gujral
Manmohan Singh|2004
Narendra Modi|2014|Modi`, 'P');

  L('canadian-pms', 3, 'Name a prime minister of Canada.', 'start of first term', [1896.4, 1948], `
John A. Macdonald|1867|Macdonald;John Macdonald
Alexander Mackenzie|1873
John Abbott|1891
John Thompson|1892
Mackenzie Bowell|1894|Bowell
Charles Tupper|1896.3|Tupper
Wilfrid Laurier|1896.5|Laurier
Robert Borden|1911|Borden
Arthur Meighen|1920|Meighen
William Lyon Mackenzie King|1921|Mackenzie King;King
R. B. Bennett|1930|Bennett;Richard Bennett
Louis St. Laurent|1948|St Laurent;Saint Laurent
John Diefenbaker|1957|Diefenbaker
Lester B. Pearson|1963|Pearson;Lester Pearson
Pierre Trudeau|1968|Pierre Elliott Trudeau
Joe Clark|1979
John Turner|1984.5
Brian Mulroney|1984.7|Mulroney
Kim Campbell|1993.5
Jean Chretien|1993.8|Chretien
Paul Martin|2003
Stephen Harper|2006|Harper
Justin Trudeau|2015
Mark Carney|2025|Carney`, 'P');

  L('australian-pms', 3, 'Name a prime minister of Australia.', 'start of first term', [1915, 1949], `
Edmund Barton|1901|Barton
Alfred Deakin|1903|Deakin
Chris Watson|1904.3
George Reid|1904.6
Andrew Fisher|1908
Joseph Cook|1913
Billy Hughes|1915|William Hughes
Stanley Bruce|1923
James Scullin|1929|Scullin
Joseph Lyons|1932|Lyons
Earle Page|1939.3
Robert Menzies|1939.32|Menzies
Arthur Fadden|1941.65|Fadden
John Curtin|1941.77|Curtin
Frank Forde|1945.5|Forde
Ben Chifley|1945.53|Chifley
Harold Holt|1966
John McEwen|1967.96|McEwen
John Gorton|1968|Gorton
William McMahon|1971|McMahon
Gough Whitlam|1972|Whitlam
Malcolm Fraser|1975
Bob Hawke|1983|Hawke
Paul Keating|1991|Keating
John Howard|1996
Kevin Rudd|2007|Rudd
Julia Gillard|2010|Gillard
Tony Abbott|2013
Malcolm Turnbull|2015|Turnbull
Scott Morrison|2018
Anthony Albanese|2022|Albanese;Albo`, 'P');

  L('winter-olympics', 3, 'Name a place that has hosted the Winter Olympics.', 'its first Games', [1936, 1972], `
Chamonix|1924
St. Moritz|1928|Saint Moritz
Lake Placid|1932
Garmisch-Partenkirchen|1936|Garmisch
Oslo|1952
Cortina d'Ampezzo|1956|Cortina
Squaw Valley|1960|Palisades Tahoe
Innsbruck|1964
Grenoble|1968
Sapporo|1972
Sarajevo|1984
Calgary|1988
Albertville|1992
Lillehammer|1994
Nagano|1998
Salt Lake City|2002|Salt Lake
Turin|2006|Torino
Vancouver|2010
Sochi|2014
Pyeongchang|2018
Beijing|2022|Peking
Milan|2026|Milano;Milan Cortina;Milano Cortina`);

  // ======================= everyday knowledge =======================
  // Not history out of books but the things people grew up with: games, phones, films,
  // records, football, sweets. The rule is the same, and so is the catch: everybody
  // can name one, but who can name the oldest?
  TOPIC = 'everyday';

  L('gta-games', 1, 'Name a Grand Theft Auto game.', 'release', [2000, 2005], `
Grand Theft Auto|1997|GTA;GTA 1;Grand Theft Auto 1
Grand Theft Auto: London 1969|1999|GTA London;GTA London 1969;London 1969
Grand Theft Auto: London 1961|1999|GTA London 1961;London 1961
Grand Theft Auto 2|1999|GTA 2;GTA2
Grand Theft Auto III|2001|GTA 3;GTA III;GTA3
Grand Theft Auto: Vice City|2002|GTA Vice City;Vice City;GTA VC
Grand Theft Auto Advance|2004|GTA Advance
Grand Theft Auto: San Andreas|2004|GTA San Andreas;San Andreas;GTA SA
Grand Theft Auto: Liberty City Stories|2005|GTA Liberty City Stories;Liberty City Stories
Grand Theft Auto: Vice City Stories|2006|GTA Vice City Stories;Vice City Stories
Grand Theft Auto IV|2008|GTA 4;GTA IV;GTA4
Grand Theft Auto: The Lost and Damned|2009|The Lost and Damned;Lost and Damned;GTA The Lost and Damned
Grand Theft Auto: Chinatown Wars|2009|GTA Chinatown Wars;Chinatown Wars
Grand Theft Auto: The Ballad of Gay Tony|2009|The Ballad of Gay Tony;Ballad of Gay Tony;GTA The Ballad of Gay Tony
Grand Theft Auto: Episodes from Liberty City|2009|Episodes from Liberty City
Grand Theft Auto V|2013|GTA 5;GTA V;GTA5
Grand Theft Auto Online|2013|GTA Online
Grand Theft Auto: The Trilogy|2021|GTA Trilogy;The Trilogy;The Definitive Edition;GTA The Trilogy;Grand Theft Auto: The Trilogy – The Definitive Edition
Grand Theft Auto VI|2026|GTA 6;GTA VI;GTA6
`);

  L('consoles', 1, 'Name a video game console.', 'release', [1979, 1994], `
Magnavox Odyssey|1972|Odyssey
Home Pong|1975|Pong;Atari Pong;Pong console
Coleco Telstar|1976|Telstar
Fairchild Channel F|1976|Channel F
Atari 2600|1977|Atari VCS;Atari Video Computer System;Atari
Color TV-Game|1977|Nintendo Color TV-Game;Color TV Game
Magnavox Odyssey 2|1978|Odyssey 2;Philips Videopac;Videopac
Intellivision|1979|Mattel Intellivision
Microvision|1979|Milton Bradley Microvision
Game & Watch|1980|Game and Watch;Nintendo Game & Watch
ColecoVision|1982|Coleco Vision
Atari 5200|1982
Vectrex|1982
Nintendo Entertainment System|1983|NES;Famicom;Family Computer;Nintendo
SG-1000|1983|Sega SG-1000
Master System|1985|Sega Master System;Sega Mark III
Atari 7800|1986
TurboGrafx-16|1987|PC Engine;TurboGrafx 16;TurboGrafx
Sega Mega Drive|1988|Mega Drive;Sega Genesis;Genesis;Megadrive
Game Boy|1989|Nintendo Game Boy;Gameboy;Game Boy Pocket
Atari Lynx|1989|Lynx
Super Nintendo Entertainment System|1990|SNES;Super Nintendo;Super Famicom;Super NES
Game Gear|1990|Sega Game Gear
Neo Geo|1990|Neo Geo AES;NeoGeo
Philips CD-i|1991|CD-i;CDi
Sega CD|1991|Mega-CD;Mega CD
Atari Jaguar|1993|Jaguar
3DO|1993|3DO Interactive Multiplayer;Panasonic 3DO
Amiga CD32|1993|CD32
Sega Saturn|1994|Saturn
Neo Geo CD|1994
PlayStation|1994|PS1;PSX;PS One;PSone;Sony PlayStation;PlayStation 1
Sega 32X|1994|32X
Virtual Boy|1995|Nintendo Virtual Boy
Nintendo 64|1996|N64
Game Boy Color|1998|Gameboy Color;GBC
Dreamcast|1998|Sega Dreamcast
Neo Geo Pocket|1998
WonderSwan|1999
PlayStation 2|2000|PS2
Game Boy Advance|2001|GBA;Gameboy Advance;Game Boy Advance SP;GBA SP
GameCube|2001|Nintendo GameCube;Game Cube
Xbox|2001|Original Xbox;Microsoft Xbox
N-Gage|2003|Nokia N-Gage
Nintendo DS|2004|DS;DS Lite;Nintendo DS Lite;DSi;Nintendo DSi
PlayStation Portable|2004|PSP;PSP Go
Xbox 360|2005
PlayStation 3|2006|PS3
Wii|2006|Nintendo Wii
Nintendo 3DS|2011|3DS;2DS;Nintendo 2DS;New Nintendo 3DS
PlayStation Vita|2011|PS Vita;Vita
Wii U|2012|WiiU
Ouya|2013
PlayStation 4|2013|PS4;PS4 Pro;PlayStation 4 Pro
Xbox One|2013|Xbox One X;Xbox One S
Nintendo Switch|2017|Switch;Switch OLED;Nintendo Switch OLED
Nintendo Switch Lite|2019|Switch Lite
Xbox Series X|2020|Xbox Series S;Xbox Series X/S;Series X;Series S
PlayStation 5|2020|PS5;PS5 Pro;PlayStation 5 Pro
Steam Deck|2022
Playdate|2022
PlayStation Portal|2023|PS Portal
Nintendo Switch 2|2025|Switch 2
Steam Machine|2026
`);

  L('video-games', 1, 'Name a video game.', 'release', [1981, 1993], `
Cathode-ray tube amusement device|1947|Cathode ray tube amusement device;CRT amusement device
Bertie the Brain|1950
Nimrod|1951
OXO|1952
Tennis for Two|1958
Spacewar!|1962|Spacewar
Computer Space|1971
The Oregon Trail|1971|Oregon Trail
Pong|1972
Gun Fight|1975
Breakout|1976
Colossal Cave Adventure|1976|Colossal Cave
Zork|1977
Space Invaders|1978
Asteroids|1979
Galaxian|1979
Lunar Lander|1979
Pac-Man|1980|Pacman;Pac Man
Missile Command|1980
Rogue|1980
Battlezone|1980
Centipede|1981
Defender|1981
Donkey Kong|1981
Frogger|1981
Galaga|1981
Ms. Pac-Man|1982|Ms Pac-Man;Ms Pacman
Pitfall!|1982|Pitfall
Q*bert|1982|Qbert;Q bert
Dig Dug|1982
Pole Position|1982
E.T. the Extra-Terrestrial|1982|E.T.;ET
Mario Bros.|1983
Dragon's Lair|1983
Tetris|1984
Elite|1984
Duck Hunt|1984
Super Mario Bros.|1985
Gauntlet|1985
The Legend of Zelda|1986|Legend of Zelda;Zelda
Metroid|1986
Dragon Quest|1986
Castlevania|1986
Out Run|1986|OutRun
Final Fantasy|1987
Mega Man|1987|Megaman
Metal Gear|1987
Street Fighter|1987
Contra|1987
Super Mario Bros. 3|1988
Prince of Persia|1989
SimCity|1989|Sim City
Super Mario World|1990
The Secret of Monkey Island|1990|Monkey Island;Secret of Monkey Island
Sonic the Hedgehog|1991|Sonic
Street Fighter II|1991
Civilization|1991|Sid Meier's Civilization
Lemmings|1991
The Legend of Zelda: A Link to the Past|1991|A Link to the Past;Link to the Past
Mortal Kombat|1992
Super Mario Kart|1992|Mario Kart
Wolfenstein 3D|1992
Doom|1993
Myst|1993
FIFA International Soccer|1993|FIFA;FIFA 94
Super Metroid|1994
Donkey Kong Country|1994
Warcraft: Orcs & Humans|1994|Warcraft
Command & Conquer|1995|Command and Conquer
Chrono Trigger|1995
Tomb Raider|1996
Super Mario 64|1996|Mario 64
Pokémon Red and Blue|1996|Pokemon Red;Pokemon Blue;Pokemon Red and Blue;Pokemon Red and Green;Pokemon
Resident Evil|1996
Crash Bandicoot|1996
Quake|1996
Diablo|1997
Final Fantasy VII|1997|FF7
GoldenEye 007|1997|GoldenEye
Gran Turismo|1997
Grand Theft Auto|1997|GTA
Age of Empires|1997
Fallout|1997
The Legend of Zelda: Ocarina of Time|1998|Ocarina of Time
Half-Life|1998|Half Life
Metal Gear Solid|1998
StarCraft|1998
Spyro the Dragon|1998|Spyro
Super Smash Bros.|1999|Smash Bros
Tony Hawk's Pro Skater|1999|Tony Hawk;Tony Hawks Pro Skater
Counter-Strike|1999|Counter Strike
RollerCoaster Tycoon|1999
The Sims|2000|Sims
Deus Ex|2000
Diablo II|2000
Halo: Combat Evolved|2001|Halo
Grand Theft Auto III|2001|GTA 3;GTA III
RuneScape|2001
Animal Crossing|2001
Super Smash Bros. Melee|2001|Melee
Grand Theft Auto: Vice City|2002|GTA Vice City;Vice City
Kingdom Hearts|2002
Call of Duty|2003|COD
World of Warcraft|2004|WoW
Half-Life 2|2004|Half Life 2
Grand Theft Auto: San Andreas|2004|GTA San Andreas;San Andreas
God of War|2005
Guitar Hero|2005
Resident Evil 4|2005
Wii Sports|2006
The Elder Scrolls IV: Oblivion|2006|Oblivion
BioShock|2007
Portal|2007
Call of Duty 4: Modern Warfare|2007|Modern Warfare;COD 4;Call of Duty 4
Assassin's Creed|2007|Assassins Creed
Mass Effect|2007
Super Mario Galaxy|2007|Mario Galaxy
Halo 3|2007
Grand Theft Auto IV|2008|GTA 4;GTA IV
Fallout 3|2008
LittleBigPlanet|2008|Little Big Planet
Angry Birds|2009
League of Legends|2009
Uncharted 2: Among Thieves|2009|Uncharted 2
Red Dead Redemption|2010
Mass Effect 2|2010
Minecraft|2011
The Elder Scrolls V: Skyrim|2011|Skyrim
Dark Souls|2011
Portal 2|2011
Candy Crush Saga|2012|Candy Crush
Journey|2012
The Last of Us|2013|Last of Us
Grand Theft Auto V|2013|GTA 5;GTA V
Flappy Bird|2013
Destiny|2014
The Witcher 3: Wild Hunt|2015|Witcher 3;The Witcher 3
Bloodborne|2015
Rocket League|2015
Undertale|2015
Overwatch|2016
Pokémon Go|2016|Pokemon Go
The Legend of Zelda: Breath of the Wild|2017|Breath of the Wild;BOTW
Fortnite|2017
PUBG: Battlegrounds|2017|PUBG;PlayerUnknown's Battlegrounds
Super Mario Odyssey|2017|Mario Odyssey
Red Dead Redemption 2|2018|RDR2
Among Us|2018
Fall Guys|2020
Animal Crossing: New Horizons|2020|New Horizons
The Last of Us Part II|2020|Last of Us 2;The Last of Us 2
Cyberpunk 2077|2020|Cyberpunk
Hades|2020
Genshin Impact|2020
Wordle|2021
Elden Ring|2022
Hogwarts Legacy|2023
Baldur's Gate 3|2023|Baldurs Gate 3
The Legend of Zelda: Tears of the Kingdom|2023|Tears of the Kingdom;TOTK
Palworld|2024
Astro Bot|2024
Black Myth: Wukong|2024|Wukong
Clair Obscur: Expedition 33|2025|Expedition 33;Clair Obscur
Mario Kart World|2025
Hollow Knight: Silksong|2025|Silksong
Grand Theft Auto VI|2026|GTA 6;GTA VI
`);

  L('phones', 1, 'Name a mobile phone.', 'release', [1999, 2007], `
Motorola DynaTAC 8000X|1983|DynaTAC;Motorola DynaTAC;DynaTAC 8000X
Mobira Cityman 900|1987|Mobira Cityman;Nokia Cityman;Cityman
Motorola MicroTAC|1989|MicroTAC
Nokia 1011|1992
IBM Simon|1994|IBM Simon Personal Communicator
Motorola StarTAC|1996|StarTAC
Nokia 8110|1996
Nokia 9000 Communicator|1996|Nokia Communicator;Nokia 9000
Nokia 6110|1997
Siemens S10|1997
Nokia 5110|1998
Nokia 3210|1999
Nokia 7110|1999
Nokia 8210|1999
Ericsson T28|1999
Nokia 3310|2000
Sharp J-SH04|2000|J-SH04
Ericsson R380|2000
Ericsson T68|2001|Sony Ericsson T68i
Nokia 8310|2001
Nokia 7650|2002
BlackBerry 5810|2002
Danger Hiptop|2002|T-Mobile Sidekick;Sidekick;Hiptop
Sony Ericsson T610|2003
Nokia 1100|2003
Nokia N-Gage|2003|N-Gage
Nokia 6600|2003
BlackBerry 7230|2003
Motorola Razr V3|2004|Razr;Motorola Razr;Razr V3;Moto Razr
Nokia 6230|2004
Sony Ericsson K750|2005|K750i;Sony Ericsson K750i
Motorola ROKR E1|2005|ROKR;Motorola ROKR
Nokia N70|2005
Sony Ericsson W800|2005|W800i;Sony Ericsson Walkman
LG Chocolate|2006
BlackBerry Pearl|2006
Nokia N73|2006
Nokia N95|2007
LG Prada|2007
iPhone|2007|Apple iPhone;Original iPhone;iPhone 1;iPhone 2G;First iPhone
HTC Dream|2008|T-Mobile G1;G1
iPhone 3G|2008
BlackBerry Bold|2008|BlackBerry Bold 9000
BlackBerry Storm|2008
Nokia 5800 XpressMusic|2008|Nokia 5800
iPhone 3GS|2009
Motorola Droid|2009|Droid;Motorola Milestone
Palm Pre|2009
HTC Hero|2009
Nexus One|2010|Google Nexus One
iPhone 4|2010
Samsung Galaxy S|2010|Galaxy S;Galaxy S1
HTC Desire|2010
Nokia N8|2010
Samsung Galaxy S II|2011|Galaxy S2;Galaxy S II
iPhone 4S|2011
Samsung Galaxy Note|2011|Galaxy Note
Nokia Lumia 800|2011|Lumia 800
Samsung Galaxy S III|2012|Galaxy S3;Galaxy S III
iPhone 5|2012
Nexus 4|2012
Nokia Lumia 920|2012|Lumia 920
Samsung Galaxy S4|2013|Galaxy S4
iPhone 5S|2013
iPhone 5C|2013
Moto G|2013|Motorola Moto G
Nexus 5|2013
HTC One|2013|HTC One M7
Sony Xperia Z|2013|Xperia Z
OnePlus One|2014
iPhone 6|2014|iPhone 6 Plus
Samsung Galaxy S5|2014|Galaxy S5
Amazon Fire Phone|2014|Fire Phone
iPhone 6S|2015|iPhone 6S Plus
Samsung Galaxy S6|2015|Galaxy S6;Galaxy S6 Edge
iPhone SE|2016
iPhone 7|2016|iPhone 7 Plus
Google Pixel|2016|Pixel;Pixel 1;Pixel XL
Samsung Galaxy S7|2016|Galaxy S7
Samsung Galaxy Note 7|2016|Galaxy Note 7;Note 7
iPhone 8|2017|iPhone 8 Plus
iPhone X|2017
Samsung Galaxy S8|2017|Galaxy S8
Google Pixel 2|2017|Pixel 2
iPhone XS|2018|iPhone XS Max
iPhone XR|2018
Samsung Galaxy S9|2018|Galaxy S9
Huawei P20 Pro|2018|P20 Pro;Huawei P20
Google Pixel 3|2018|Pixel 3
iPhone 11|2019|iPhone 11 Pro;iPhone 11 Pro Max
Samsung Galaxy S10|2019|Galaxy S10
Samsung Galaxy Fold|2019|Galaxy Fold
Huawei P30 Pro|2019|P30 Pro;Huawei P30
Google Pixel 4|2019|Pixel 4
iPhone 12|2020|iPhone 12 Pro;iPhone 12 mini;iPhone 12 Pro Max
Samsung Galaxy S20|2020|Galaxy S20
Samsung Galaxy Z Flip|2020|Galaxy Z Flip;Z Flip
Google Pixel 5|2020|Pixel 5
iPhone 13|2021|iPhone 13 Pro;iPhone 13 mini;iPhone 13 Pro Max
Samsung Galaxy S21|2021|Galaxy S21
Google Pixel 6|2021|Pixel 6
iPhone 14|2022|iPhone 14 Pro;iPhone 14 Plus;iPhone 14 Pro Max
Samsung Galaxy S22|2022|Galaxy S22
Nothing Phone (1)|2022|Nothing Phone;Nothing Phone 1
Google Pixel 7|2022|Pixel 7
iPhone 15|2023|iPhone 15 Pro;iPhone 15 Plus;iPhone 15 Pro Max
Samsung Galaxy S23|2023|Galaxy S23
Google Pixel 8|2023|Pixel 8
iPhone 16|2024|iPhone 16 Pro;iPhone 16 Plus;iPhone 16 Pro Max
Samsung Galaxy S24|2024|Galaxy S24
Google Pixel 9|2024|Pixel 9
iPhone 16e|2025
iPhone 17|2025|iPhone 17 Pro;iPhone 17 Pro Max
iPhone Air|2025
Samsung Galaxy S25|2025|Galaxy S25
Google Pixel 10|2025|Pixel 10
Samsung Galaxy S26|2026|Galaxy S26
Google Pixel 11|2026|Pixel 11
iPhone 18 Pro|2026|iPhone 18;iPhone 18 Pro Max
iPhone Duo|2026
`);

  L('mario-games', 1, 'Name a game that has Mario in it.', 'release', [1985, 1996], `
Donkey Kong|1981
Donkey Kong Jr.|1982|Donkey Kong Junior
Mario Bros.|1983
Wrecking Crew|1985
Super Mario Bros.|1985|Super Mario
Super Mario Bros.: The Lost Levels|1986|The Lost Levels;Lost Levels
Super Mario Bros. 2|1988
Super Mario Bros. 3|1988
Super Mario Land|1989
Dr. Mario|1990|Doctor Mario
Super Mario World|1990
Super Mario Kart|1992|Mario Kart
Super Mario Land 2: 6 Golden Coins|1992|Super Mario Land 2;6 Golden Coins
Mario Paint|1992
Super Mario All-Stars|1993|Mario All-Stars
Yoshi's Island|1995|Super Mario World 2: Yoshi's Island;Yoshis Island;Super Mario World 2
Super Mario RPG|1996
Super Mario 64|1996|Mario 64
Mario Kart 64|1996
Mario Party|1998
Super Smash Bros.|1999|Smash Bros
Mario Golf|1999
Paper Mario|2000
Mario Tennis|2000
Super Smash Bros. Melee|2001|Melee
Luigi's Mansion|2001|Luigis Mansion
Super Mario Sunshine|2002|Mario Sunshine
Mario Kart: Double Dash|2003|Double Dash
Mario & Luigi: Superstar Saga|2003|Mario and Luigi Superstar Saga;Superstar Saga;Mario & Luigi;Mario and Luigi
Mario Kart DS|2005
New Super Mario Bros.|2006
Super Paper Mario|2007
Super Mario Galaxy|2007|Mario Galaxy
Mario Kart Wii|2008
Super Smash Bros. Brawl|2008|Brawl
New Super Mario Bros. Wii|2009
Super Mario Galaxy 2|2010|Mario Galaxy 2
Super Mario 3D Land|2011|3D Land
Mario Kart 7|2011
New Super Mario Bros. 2|2012
New Super Mario Bros. U|2012
Super Mario 3D World|2013|3D World
Mario Kart 8|2014
Super Mario Maker|2015|Mario Maker
Super Mario Run|2016|Mario Run
Super Mario Odyssey|2017|Mario Odyssey
Mario Kart 8 Deluxe|2017
Mario + Rabbids Kingdom Battle|2017|Mario and Rabbids;Mario + Rabbids;Mario Rabbids
Super Smash Bros. Ultimate|2018|Smash Ultimate;Smash Bros Ultimate
Super Mario Maker 2|2019|Mario Maker 2
Mario Kart Tour|2019
Super Mario Bros. Wonder|2023|Mario Wonder;Super Mario Wonder
Mario Kart World|2025
Mario Tennis Fever|2026
`);

  L('disney-films', 1, 'Name a Disney animated film (not Pixar).', 'release', [1950, 1989], `
Snow White and the Seven Dwarfs|1937|Snow White
Pinocchio|1940
Fantasia|1940
Dumbo|1941
Bambi|1942
Saludos Amigos|1942
The Three Caballeros|1944|Three Caballeros
Make Mine Music|1946
Fun and Fancy Free|1947
Melody Time|1948
The Adventures of Ichabod and Mr. Toad|1949|Ichabod and Mr. Toad;Ichabod and Mr Toad
Cinderella|1950
Alice in Wonderland|1951
Peter Pan|1953
Lady and the Tramp|1955
Sleeping Beauty|1959
One Hundred and One Dalmatians|1961|101 Dalmatians;101 Dalmations;One Hundred and One Dalmations
The Sword in the Stone|1963|Sword in the Stone
The Jungle Book|1967|Jungle Book
The Aristocats|1970|Aristocats
Robin Hood|1973
The Many Adventures of Winnie the Pooh|1977|Many Adventures of Winnie the Pooh
The Rescuers|1977|Rescuers
The Fox and the Hound|1981|Fox and the Hound
The Black Cauldron|1985|Black Cauldron
The Great Mouse Detective|1986|Great Mouse Detective;Basil the Great Mouse Detective
Oliver & Company|1988|Oliver and Company
The Little Mermaid|1989|Little Mermaid
The Rescuers Down Under|1990|Rescuers Down Under
Beauty and the Beast|1991
Aladdin|1992
The Lion King|1994|Lion King
Pocahontas|1995
The Hunchback of Notre Dame|1996|Hunchback of Notre Dame
Hercules|1997
Mulan|1998
Tarzan|1999
Fantasia 2000|1999
Dinosaur|2000
The Emperor's New Groove|2000|Emperor's New Groove;Emperors New Groove
Atlantis: The Lost Empire|2001|Atlantis
Lilo & Stitch|2002|Lilo and Stitch
Treasure Planet|2002
Brother Bear|2003
Home on the Range|2004
Chicken Little|2005
Meet the Robinsons|2007
Bolt|2008
The Princess and the Frog|2009|Princess and the Frog
Tangled|2010
Winnie the Pooh|2011
Wreck-It Ralph|2012|Wreck It Ralph
Frozen|2013
Big Hero 6|2014
Zootopia|2016|Zootropolis
Moana|2016
Ralph Breaks the Internet|2018|Wreck-It Ralph 2
Frozen II|2019|Frozen 2
Raya and the Last Dragon|2021|Raya
Encanto|2021
Strange World|2022
Wish|2023
Moana 2|2024
Zootopia 2|2025|Zootropolis 2
`);

  L('pixar-films', 1, 'Name a Pixar film.', 'release', [1999, 2009], `
Toy Story|1995
A Bug's Life|1998|Bug's Life;Bugs Life
Toy Story 2|1999
Monsters, Inc.|2001|Monsters Inc;Monsters Incorporated
Finding Nemo|2003
The Incredibles|2004|Incredibles
Cars|2006
Ratatouille|2007
WALL-E|2008|Wall E;WallE
Up|2009
Toy Story 3|2010
Cars 2|2011
Brave|2012
Monsters University|2013
Inside Out|2015
The Good Dinosaur|2015|Good Dinosaur
Finding Dory|2016
Cars 3|2017
Coco|2017
Incredibles 2|2018|The Incredibles 2
Toy Story 4|2019
Onward|2020
Soul|2020
Luca|2021
Turning Red|2022
Lightyear|2022
Elemental|2023
Inside Out 2|2024
Elio|2025
Hoppers|2026
Toy Story 5|2026
`);

  L('bond-films', 1, 'Name a James Bond film.', 'release', [1965, 1979], `
Dr. No|1962|Dr No;Doctor No
From Russia with Love|1963
Goldfinger|1964
Thunderball|1965
You Only Live Twice|1967
On Her Majesty's Secret Service|1969|On Her Majestys Secret Service;OHMSS
Diamonds Are Forever|1971
Live and Let Die|1973
The Man with the Golden Gun|1974|Man with the Golden Gun
The Spy Who Loved Me|1977|Spy Who Loved Me
Moonraker|1979
For Your Eyes Only|1981
Octopussy|1983
Never Say Never Again|1983
A View to a Kill|1985|View to a Kill
The Living Daylights|1987|Living Daylights
Licence to Kill|1989|License to Kill
GoldenEye|1995|Golden Eye
Tomorrow Never Dies|1997
The World Is Not Enough|1999|World Is Not Enough
Die Another Day|2002
Casino Royale|2006
Quantum of Solace|2008
Skyfall|2012
Spectre|2015
No Time to Die|2021
`);

  L('star-wars-films', 1, 'Name a Star Wars film.', 'release', [1977, 1985], `
Star Wars|1977|A New Hope;Episode IV;Star Wars: A New Hope;Episode 4
The Star Wars Holiday Special|1978|Star Wars Holiday Special;Holiday Special
The Empire Strikes Back|1980|Empire Strikes Back;Episode V;Episode 5
Return of the Jedi|1983|Episode VI;Episode 6
Caravan of Courage: An Ewok Adventure|1984|Caravan of Courage;The Ewok Adventure;Ewok Adventure
Ewoks: The Battle for Endor|1985|The Battle for Endor;Battle for Endor
The Phantom Menace|1999|Phantom Menace;Episode I;Episode 1
Attack of the Clones|2002|Episode II;Episode 2
Revenge of the Sith|2005|Episode III;Episode 3
Star Wars: The Clone Wars|2008|The Clone Wars;Clone Wars
The Force Awakens|2015|Force Awakens;Episode VII;Episode 7
Rogue One|2016|Rogue One: A Star Wars Story
The Last Jedi|2017|Last Jedi;Episode VIII;Episode 8
Solo: A Star Wars Story|2018|Solo
The Rise of Skywalker|2019|Rise of Skywalker;Episode IX;Episode 9
The Mandalorian and Grogu|2026|Mandalorian and Grogu;The Mandalorian & Grogu
`);

  L('marvel-films', 1, 'Name a Marvel Cinematic Universe film.', 'release', [2009, 2013], `
Iron Man|2008.33
The Incredible Hulk|2008.45|Incredible Hulk
Iron Man 2|2010
Thor|2011
Captain America: The First Avenger|2011|The First Avenger;First Avenger;Captain America
The Avengers|2012|Avengers;Avengers Assemble
Iron Man 3|2013
Thor: The Dark World|2013|The Dark World;Thor 2
Captain America: The Winter Soldier|2014|The Winter Soldier;Winter Soldier
Guardians of the Galaxy|2014
Avengers: Age of Ultron|2015|Age of Ultron
Ant-Man|2015|Antman
Captain America: Civil War|2016|Civil War
Doctor Strange|2016|Dr Strange
Guardians of the Galaxy Vol. 2|2017|Guardians of the Galaxy 2;Guardians 2
Spider-Man: Homecoming|2017|Homecoming;Spiderman Homecoming
Thor: Ragnarok|2017|Ragnarok
Black Panther|2018
Avengers: Infinity War|2018|Infinity War
Ant-Man and the Wasp|2018|Antman and the Wasp
Captain Marvel|2019
Avengers: Endgame|2019|Endgame
Spider-Man: Far From Home|2019|Far From Home
Black Widow|2021
Shang-Chi and the Legend of the Ten Rings|2021|Shang-Chi;Shang Chi
Eternals|2021|The Eternals
Spider-Man: No Way Home|2021|No Way Home
Doctor Strange in the Multiverse of Madness|2022|Multiverse of Madness;Doctor Strange 2
Thor: Love and Thunder|2022|Love and Thunder
Black Panther: Wakanda Forever|2022|Wakanda Forever;Black Panther 2
Ant-Man and the Wasp: Quantumania|2023|Quantumania
Guardians of the Galaxy Vol. 3|2023|Guardians of the Galaxy 3;Guardians 3
The Marvels|2023|Marvels
Deadpool & Wolverine|2024|Deadpool and Wolverine
Captain America: Brave New World|2025|Brave New World
Thunderbolts|2025|Thunderbolts*;The New Avengers
The Fantastic Four: First Steps|2025|Fantastic Four;First Steps;Fantastic Four First Steps
Spider-Man: Brand New Day|2026|Brand New Day
`);

  L('harry-potter-books', 1, 'Name a Harry Potter book.', 'publication', [1997, 1999], `
Harry Potter and the Philosopher's Stone|1997|Philosopher's Stone;Philosophers Stone;Sorcerer's Stone;Sorcerers Stone;Harry Potter and the Sorcerer's Stone
Harry Potter and the Chamber of Secrets|1998|Chamber of Secrets
Harry Potter and the Prisoner of Azkaban|1999|Prisoner of Azkaban
Harry Potter and the Goblet of Fire|2000|Goblet of Fire
Fantastic Beasts and Where to Find Them|2001|Fantastic Beasts
Quidditch Through the Ages|2001
Harry Potter and the Order of the Phoenix|2003|Order of the Phoenix
Harry Potter and the Half-Blood Prince|2005|Half-Blood Prince;Half Blood Prince
Harry Potter and the Deathly Hallows|2007|Deathly Hallows
The Tales of Beedle the Bard|2008|Tales of Beedle the Bard;Beedle the Bard
Harry Potter and the Cursed Child|2016|Cursed Child;The Cursed Child
`);

  L('taylor-swift-albums', 1, 'Name a Taylor Swift album.', 'release', [2008, 2014], `
Taylor Swift|2006|Debut;Self-titled
Fearless|2008|Fearless (Taylor's Version)
Speak Now|2010|Speak Now (Taylor's Version)
Red|2012|Red (Taylor's Version)
1989|2014|1989 (Taylor's Version)
Reputation|2017
Lover|2019
Folklore|2020
Evermore|2020
Midnights|2022
The Tortured Poets Department|2024|Tortured Poets Department;TTPD
The Life of a Showgirl|2025|Life of a Showgirl;The Life of a Showgirl: The Encore;Showgirl
`);

  L('disney-princesses', 1, 'Name a Disney princess.', 'first film', [1950, 1992], `
Snow White|1937
Cinderella|1950
Aurora|1959|Sleeping Beauty;Princess Aurora;Briar Rose
Eilonwy|1985|Princess Eilonwy
Ariel|1989|The Little Mermaid
Belle|1991
Jasmine|1992
Pocahontas|1995
Mulan|1998|Fa Mulan
Kida|2001|Kidagakash
Tiana|2009
Rapunzel|2010
Merida|2012
Anna|2013
Elsa|2013
Moana|2016
Raya|2021
`);

  L('world-cup-winners', 1, "Name a country that has won the men's football World Cup.", 'first title', [1934, 1966], `
Uruguay|1930
Italy|1934
Germany|1954|West Germany
Brazil|1958|Brasil
England|1966
Argentina|1978
France|1998
Spain|2010
`);

  L('apple-products', 1, 'Name an Apple product line.', 'release', [1984, 2001], `
Apple I|1976|Apple 1;Apple-1
Apple II|1977|Apple 2
Apple III|1980|Apple 3
Apple Lisa|1983|Lisa
Macintosh|1984|Mac;Apple Macintosh;Macintosh 128K
LaserWriter|1985
Macintosh Portable|1989
PowerBook|1991|Macintosh PowerBook
Apple Newton|1993|Newton;MessagePad;Newton MessagePad
QuickTake|1994|Apple QuickTake
Pippin|1996|Apple Pippin
iMac|1998|iMac G3
iBook|1999
AirPort|1999|Apple AirPort
Power Mac G4 Cube|2000|G4 Cube
iPod|2001
Xserve|2002
iPod Mini|2004
Mac Mini|2005
iPod Nano|2005
iPod Shuffle|2005
MacBook|2006
MacBook Pro|2006
Mac Pro|2006
Apple TV|2007
iPhone|2007
iPod Touch|2007
MacBook Air|2008
iPad|2010
iPad Mini|2012
Apple Watch|2015
Apple Pencil|2015
iPad Pro|2015
AirPods|2016
HomePod|2018
AirPods Pro|2019
AirPods Max|2020
AirTag|2021|AirTags
Mac Studio|2022
Apple Vision Pro|2024|Vision Pro
`);

  L('football-clubs', 1, 'Name a British football club.', 'founding', [1870, 1885], `
Sheffield F.C.|1857|Sheffield FC
Cray Wanderers|1860
Hallam F.C.|1860|Hallam;Hallam FC
Notts County|1862
Stoke City|1863|Stoke
Wrexham|1864
Nottingham Forest|1865|Forest;Notts Forest
Chesterfield|1866
Sheffield Wednesday|1867|Wednesday
Queen's Park|1867|Queens Park
Kilmarnock|1869
Reading|1871
Rangers|1872|Glasgow Rangers
Dumbarton|1872
Aston Villa|1874|Villa
Bolton Wanderers|1874|Bolton
Heart of Midlothian|1874|Hearts
Blackburn Rovers|1875|Blackburn
Birmingham City|1875|Birmingham
Hibernian|1875|Hibs
Middlesbrough|1876|Boro
Port Vale|1876
Partick Thistle|1876
Wolverhampton Wanderers|1877|Wolves
Crewe Alexandra|1877|Crewe
St Mirren|1877|Saint Mirren
Everton|1878
Manchester United|1878|Man United;Man Utd;Man U;Newton Heath
West Bromwich Albion|1878|West Brom;WBA
Ipswich Town|1878|Ipswich
Grimsby Town|1878|Grimsby
Fulham|1879
Sunderland|1879
Doncaster Rovers|1879|Doncaster
Cliftonville|1879
Manchester City|1880|Man City
Preston North End|1880|Preston
Leyton Orient|1881|Orient
Watford|1881
Burnley|1882
Tottenham Hotspur|1882|Tottenham;Spurs
Queens Park Rangers|1882|QPR
Glentoran|1882
Coventry City|1883|Coventry
Bristol Rovers|1883
Stockport County|1883|Stockport
Derby County|1884|Derby
Leicester City|1884|Leicester
Tranmere Rovers|1884|Tranmere
Lincoln City|1884|Lincoln
St Johnstone|1884|Saint Johnstone
Luton Town|1885|Luton
Millwall|1885
Southampton|1885|Saints
Bury|1885
Arsenal|1886|Woolwich Arsenal
Plymouth Argyle|1886|Plymouth
Motherwell|1886
Linfield|1886
Barnsley|1887
Celtic|1887|Glasgow Celtic
Blackpool|1887
Wycombe Wanderers|1887|Wycombe
Sheffield United|1889|Sheffield Utd
Brentford|1889
Forest Green Rovers|1889|Forest Green
Liverpool|1892
Newcastle United|1892|Newcastle
Dundee|1893
Oxford United|1893|Oxford
Bristol City|1894
West Ham United|1895|West Ham;Thames Ironworks
Oldham Athletic|1895|Oldham
Portsmouth|1898|Pompey
Bournemouth|1899|AFC Bournemouth
Cardiff City|1899|Cardiff
Brighton & Hove Albion|1901|Brighton;Brighton and Hove Albion
Norwich City|1902|Norwich
Aberdeen|1903
Hull City|1904|Hull
Chelsea|1905
Charlton Athletic|1905|Charlton
Crystal Palace|1905|Palace
Huddersfield Town|1908|Huddersfield
Dundee United|1909
Swansea City|1912|Swansea
Cambridge United|1912
Newport County|1912|Newport
Leeds United|1919|Leeds
Rotherham United|1925|Rotherham
Wigan Athletic|1932|Wigan
Peterborough United|1934|Peterborough
Salford City|1940|Salford
AFC Wimbledon|2002
MK Dons|2004|Milton Keynes Dons
`);

  L('soft-drinks', 1, 'Name a soft drink.', 'first sold', [1886, 1929], `
Schweppes|1783
R. White's Lemonade|1845|R Whites;R. White's;R Whites Lemonade
Vernors|1866|Vernor's
Hires Root Beer|1876|Hires
Dr Pepper|1885|Dr. Pepper;Doctor Pepper
Coca-Cola|1886|Coke;Coca Cola
Pepsi|1893|Pepsi-Cola;Pepsi Cola;Brad's Drink
Barq's|1898|Barqs
Irn-Bru|1901|Irn Bru;Iron Brew
Canada Dry|1904|Canada Dry Ginger Ale
RC Cola|1905|Royal Crown Cola
Vimto|1908
Orange Crush|1911|Crush
A&W Root Beer|1919|A&W;A and W
Guaraná Antarctica|1921|Guarana Antarctica;Guarana
Tizer|1924
Lucozade|1927
7 Up|1929|7UP;Seven Up
Inca Kola|1935
Orangina|1936
Ribena|1938
Mountain Dew|1940|Mtn Dew
Fanta|1940
Tango|1950
Mirinda|1959
Sprite|1961
Tab|1963
Diet Pepsi|1964
Fresca|1966
Appletiser|1966
Capri-Sun|1969|Capri Sun
Lilt|1975
Ting|1976
Sunkist|1979
Mello Yello|1979
Diet Coke|1982|Diet Coca-Cola;Coca-Cola Light;Coke Light
Cherry Coke|1985|Coca-Cola Cherry
Red Bull|1987
Pepsi Max|1993
J2O|1998
Monster Energy|2002|Monster
Coca-Cola Zero|2005|Coke Zero;Coke Zero Sugar;Coca-Cola Zero Sugar
`);

  L('chocolate-bars', 1, 'Name a chocolate bar or chocolate sweet.', 'first sold', [1908, 1937], `
Fry's Chocolate Cream|1866|Frys Chocolate Cream;Fry's;Chocolate Cream
Hershey's Milk Chocolate|1900|Hershey Bar;Hershey's;Hersheys;Hershey's bar
Milka|1901
Cadbury Dairy Milk|1905|Dairy Milk
Hershey's Kisses|1907|Hershey Kisses;Kisses
Toblerone|1908
Bournville|1908|Cadbury Bournville
Fry's Turkish Delight|1914|Turkish Delight
Milk Tray|1915|Cadbury Milk Tray
Flake|1920|Cadbury Flake
Baby Ruth|1921
Milky Way|1923
Butterfinger|1923
Fruit & Nut|1926|Cadbury Fruit & Nut;Fruit and Nut
Reese's Peanut Butter Cups|1928|Reese's;Reeses;Reese's Cups
Crunchie|1929|Cadbury Crunchie
Snickers|1930|Marathon
Freddo|1930
Mars|1932|Mars bar
3 Musketeers|1932|Three Musketeers
Terry's Chocolate Orange|1932|Chocolate Orange
Whole Nut|1933|Cadbury Whole Nut
Kit Kat|1935|KitKat
Aero|1935
Milkybar|1936|Milky Bar
Maltesers|1936
Quality Street|1936
Rolo|1937
Smarties|1937
Roses|1938|Cadbury Roses
Nestlé Crunch|1938|Crunch;Nestle Crunch
M&M's|1941|M&Ms;M and Ms
Fudge|1948|Cadbury Fudge
Lindor|1949|Lindt Lindor
Bounty|1951
Daim|1953|Dime
Munchies|1957
Picnic|1958|Cadbury Picnic
Caramac|1959
Galaxy|1960
After Eight|1962
Toffee Crisp|1963
Creme Egg|1963|Cadbury Creme Egg
Twix|1967
Revels|1967
Kinder Chocolate|1968|Kinder
Matchmakers|1968
Star Bar|1968
Ripple|1969|Galaxy Ripple
Curly Wurly|1970
Kinder Surprise|1974|Kinder Egg
Yorkie|1976
Double Decker|1976
Lion|1976|Lion bar
Minstrels|1976|Galaxy Minstrels
Ferrero Rocher|1979
Drifter|1980
Wispa|1981
Boost|1985
Twirl|1985
Kinder Bueno|1990|Bueno
Time Out|1992
Celebrations|1997
Heroes|1999|Cadbury Heroes
`);

  L('superheroes', 1, 'Name a Marvel or DC superhero.', 'first appearance', [1941, 1964], `
Doctor Occult|1935|Dr Occult;Dr. Occult
Superman|1938|Clark Kent;Man of Steel
Batman|1939|Bruce Wayne;The Dark Knight;Dark Knight
Namor|1939|Namor the Sub-Mariner;Sub-Mariner;Submariner
Human Torch|1939|The Human Torch
Sandman|1939|Wesley Dodds
The Flash|1940|Flash;Jay Garrick;Barry Allen
Hawkman|1940
The Spectre|1940|Spectre
Shazam|1940|Billy Batson;Captain Marvel (DC)
Robin|1940|Dick Grayson;Nightwing
Green Lantern|1940|Alan Scott;Hal Jordan
Captain America|1941|Steve Rogers
Bucky|1941|Bucky Barnes;Winter Soldier;The Winter Soldier
Plastic Man|1941
Wonder Woman|1941|Diana Prince
Aquaman|1941
Green Arrow|1941|Oliver Queen
Martian Manhunter|1955
Supergirl|1959|Kara Zor-El
Groot|1960
Batgirl|1961|Barbara Gordon
Fantastic Four|1961|Mister Fantastic;Mr Fantastic;Invisible Woman;The Thing;Reed Richards
Ant-Man|1962|Antman;Hank Pym
Hulk|1962|The Hulk;The Incredible Hulk;Incredible Hulk;Bruce Banner
Spider-Man|1962|Spiderman;Peter Parker;Spidey
Thor|1962
Iron Man|1963|Tony Stark;Ironman
Nick Fury|1963
The Wasp|1963|Wasp
Doctor Strange|1963|Dr Strange;Dr. Strange;Stephen Strange
X-Men|1963|Cyclops;Professor X;Jean Grey;Beast;Iceman
Scarlet Witch|1964|Wanda Maximoff;Wanda
Quicksilver|1964
Daredevil|1964|Matt Murdock
Black Widow|1964|Natasha Romanoff
Teen Titans|1964|Titans
Hawkeye|1964|Clint Barton
Silver Surfer|1966
Black Panther|1966|T'Challa
Captain Marvel|1967|Carol Danvers;Mar-Vell
Vision|1968|The Vision
Falcon|1969|The Falcon;Sam Wilson
Luke Cage|1972|Power Man
Ghost Rider|1972
Blade|1973
Shang-Chi|1973|Shang Chi
The Punisher|1974|Punisher;Frank Castle
Wolverine|1974|Logan
Storm|1975|Ororo Munroe
Nightcrawler|1975
Colossus|1975
Moon Knight|1975
Star-Lord|1976|Star Lord;Peter Quill
Rocket Raccoon|1976|Rocket
Ms. Marvel|1977|Ms Marvel;Kamala Khan
Spider-Woman|1977|Spiderwoman
War Machine|1979|James Rhodes;Rhodey
She-Hulk|1980|She Hulk
Cyborg|1980
Starfire|1980
Raven|1980
Elektra|1981
Rogue|1981
Venom|1988|Eddie Brock
Cable|1990
Gambit|1990
Deadpool|1991|Wade Wilson
Jessica Jones|2001
Miles Morales|2011
`);

  // ----- tier 2 -----

  L('zelda-games', 2, 'Name a Legend of Zelda game.', 'release', [1987, 1998], `
The Legend of Zelda|1986|Legend of Zelda;Zelda;Zelda 1
Zelda II: The Adventure of Link|1987|Zelda 2;Zelda II;The Adventure of Link;Adventure of Link
A Link to the Past|1991|Link to the Past;The Legend of Zelda: A Link to the Past
Link's Awakening|1993|Links Awakening
Link: The Faces of Evil|1993|The Faces of Evil;Faces of Evil
Zelda: The Wand of Gamelon|1993|The Wand of Gamelon;Wand of Gamelon
Zelda's Adventure|1994|Zeldas Adventure
Ocarina of Time|1998|OOT;Ocarina
Majora's Mask|2000|Majoras Mask
Oracle of Seasons|2001|Oracle of Ages;Oracle of Seasons and Oracle of Ages
Four Swords|2002
The Wind Waker|2002|Wind Waker;Windwaker
Four Swords Adventures|2004
The Minish Cap|2004|Minish Cap
Twilight Princess|2006
Phantom Hourglass|2007
Link's Crossbow Training|2007|Links Crossbow Training;Crossbow Training
Spirit Tracks|2009
Skyward Sword|2011
A Link Between Worlds|2013|Link Between Worlds
Hyrule Warriors|2014
Tri Force Heroes|2015|Triforce Heroes
Breath of the Wild|2017|BOTW
Cadence of Hyrule|2019
Hyrule Warriors: Age of Calamity|2020|Age of Calamity
Tears of the Kingdom|2023|TOTK
Echoes of Wisdom|2024
Hyrule Warriors: Age of Imprisonment|2025|Age of Imprisonment
`);

  L('final-fantasy-games', 2, 'Name a Final Fantasy game.', 'release', [1990, 1997], `
Final Fantasy|1987|Final Fantasy I;Final Fantasy 1;FF1
Final Fantasy II|1988|FF2
Final Fantasy III|1990|FF3
Final Fantasy IV|1991|FF4
Final Fantasy Adventure|1991
Final Fantasy V|1992|FF5
Final Fantasy Mystic Quest|1992|Mystic Quest
Final Fantasy VI|1994|FF6
Final Fantasy VII|1997|FF7
Final Fantasy Tactics|1997|FF Tactics
Final Fantasy VIII|1999|FF8
Final Fantasy IX|2000|FF9
Final Fantasy X|2001|FF10;FFX
Final Fantasy XI|2002|FF11
Final Fantasy X-2|2003|FFX-2
Final Fantasy Crystal Chronicles|2003|Crystal Chronicles
Final Fantasy XII|2006|FF12
Crisis Core: Final Fantasy VII|2007|Crisis Core
Dissidia Final Fantasy|2008|Dissidia
Final Fantasy XIII|2009|FF13
Final Fantasy XIV|2010|FF14;A Realm Reborn
Final Fantasy Type-0|2011|Type-0
Final Fantasy XV|2016|FF15
World of Final Fantasy|2016
Final Fantasy VII Remake|2020|FF7 Remake
Stranger of Paradise: Final Fantasy Origin|2022|Stranger of Paradise
Final Fantasy XVI|2023|FF16
Final Fantasy VII Rebirth|2024|FF7 Rebirth
`);

  L('beatles-albums', 2, 'Name a Beatles studio album.', 'release', [1964, 1966], `
Please Please Me|1963.2
With the Beatles|1963.9
A Hard Day's Night|1964|Hard Day's Night;A Hard Days Night
Beatles for Sale|1964
Help!|1965|Help
Rubber Soul|1965
Revolver|1966
Sgt. Pepper's Lonely Hearts Club Band|1967|Sgt Pepper;Sgt. Pepper;Sergeant Pepper;Sgt Peppers;Sgt. Pepper's
Magical Mystery Tour|1967
The Beatles|1968|The White Album;White Album
Yellow Submarine|1969
Abbey Road|1969
Let It Be|1970
`);

  L('f1-champions', 2, 'Name a Formula One world champion.', 'first title', [1959, 1980], `
Giuseppe Farina|1950|Nino Farina
Juan Manuel Fangio|1951
Alberto Ascari|1952
Mike Hawthorn|1958
Jack Brabham|1959
Phil Hill|1961
Graham Hill|1962
Jim Clark|1963
John Surtees|1964
Denny Hulme|1967|Denis Hulme
Jackie Stewart|1969
Jochen Rindt|1970
Emerson Fittipaldi|1972
Niki Lauda|1975
James Hunt|1976
Mario Andretti|1978
Jody Scheckter|1979
Alan Jones|1980
Nelson Piquet|1981
Keke Rosberg|1982
Alain Prost|1985
Ayrton Senna|1988
Nigel Mansell|1992
Michael Schumacher|1994
Damon Hill|1996
Jacques Villeneuve|1997
Mika Häkkinen|1998|Mika Hakkinen
Fernando Alonso|2005
Kimi Räikkönen|2007|Kimi Raikkonen
Lewis Hamilton|2008
Jenson Button|2009
Sebastian Vettel|2010
Nico Rosberg|2016
Max Verstappen|2021
Lando Norris|2025
Kimi Antonelli|2026|Andrea Kimi Antonelli
`, 'P');

  L('euro-winners', 2, "Name a country that has won the men's European Championship.", 'first title', [1964, 1976], `
Soviet Union|1960|USSR
Spain|1964
Italy|1968
Germany|1972|West Germany
Czechoslovakia|1976
France|1984
Netherlands|1988|Holland
Denmark|1992
Greece|2004
Portugal|2016
`);

  L('champions-league-winners', 2, 'Name a club that has won the European Cup or Champions League.', 'first title', [1964, 1979], `
Real Madrid|1956
Benfica|1961
AC Milan|1963|Milan
Inter Milan|1964|Inter;Internazionale
Celtic|1967
Manchester United|1968|Man United;Man Utd;Man U
Feyenoord|1970
Ajax|1971
Bayern Munich|1974|Bayern
Liverpool|1977
Nottingham Forest|1979|Forest
Aston Villa|1982|Villa
Hamburg|1983|Hamburger SV;HSV
Juventus|1985|Juve
Steaua Bucharest|1986|Steaua;FCSB
Porto|1987|FC Porto
PSV Eindhoven|1988|PSV
Red Star Belgrade|1991|Red Star;Crvena Zvezda
Barcelona|1992|Barca;FC Barcelona
Marseille|1993|Olympique de Marseille
Borussia Dortmund|1997|Dortmund
Chelsea|2012
Manchester City|2023|Man City
Paris Saint-Germain|2025|PSG;Paris St Germain
`);

  TOPIC = 'history';

  // ======================= narrower questions from the rolls above =======================
  var N = null;
  V('us-presidents-1900s', 'us-presidents', 1, 'Name a US president who took office in the 20th century.', [1923, 1961], 1901, 2000);
  V('wars-1900s', 'wars', 1, 'Name a war that began in the 20th century.', [1918, 1950], 1900, 1999.99);
  V('battles-1900s', 'battles', 1, 'Name a battle of the 20th century.', [1918, 1941.99], 1900, 1999.99);
  V('inventions-1800s', 'inventions', 1, 'Name an invention of the 19th century.', [1829.99, 1869.99], 1800, 1899.99);
  V('landmarks-pre1500', 'landmarks', 1, 'Name a famous landmark built before 1500.', [-1000, 500], N, 1499.99);
  V('scientists-1800-on', 'scientists', 1, 'Name a famous scientist born since 1800.', [1849.99, 1899.99], 1800, N);
  V('writers-1800s', 'writers', 1, 'Name a famous writer born in the 19th century.', [1819.99, 1859.99], 1800, 1899.99);
  V('generals-1700-on', 'generals', 1, 'Name a famous general from 1700 onwards.', [1799.99, 1899.99], 1700, N);
  V('eng-monarchs-1714-on', 'eng-monarchs', 1, 'Name a British monarch since 1714.', [1727, 1837], 1714, N);

  V('roman-emperors-to-200', 'roman-emperors', 2, 'Name a Roman emperor who took power before the year 200.', [41, 96], N, 199);
  V('eng-monarchs-medieval', 'eng-monarchs', 2, 'Name a ruler of England who took the throne between 1066 and 1485.', [1154, 1327], 1066, 1485);
  V('eng-monarchs-tudor-stuart', 'eng-monarchs', 2, 'Name a Tudor or Stuart monarch.', [1547, 1625], 1485, 1713);
  V('us-presidents-1800s', 'us-presidents', 2, 'Name a US president who took office in the 19th century.', [1829, 1861], 1801, 1900);
  V('wars-pre1800', 'wars', 2, 'Name a war that began before 1800.', [0, 1499], N, 1799.99);
  V('battles-pre1500', 'battles', 2, 'Name a battle fought before 1500.', [0, 1066.99], N, 1499.99);
  V('empires-ancient', 'empires', 2, 'Name an empire founded before the year 500.', [-1000, -200], N, 499);
  V('inventions-pre1800', 'inventions', 2, 'Name an invention from before 1800.', [0, 1499], N, 1799.99);
  V('explorers-pre1600', 'explorers', 2, 'Name an explorer who set out before 1600.', [1400, 1500], N, 1599.99);
  V('scientists-pre1800', 'scientists', 2, 'Name a scientist born before 1800.', [1000, 1599], N, 1799.99);
  V('writers-pre1800', 'writers', 2, 'Name a writer born before 1800.', [0, 1499], N, 1799.99);
  V('painters-pre1700', 'painters', 2, 'Name a painter born before 1700.', [1449, 1549], N, 1699.99);
  V('composers-1800-on', 'composers', 2, 'Name a composer born since 1800.', [1819.99, 1859.99], 1800, N);
  V('philosophers-ancient', 'philosophers', 2, 'Name a philosopher of the ancient world.', [-500, -300], N, 500);
  V('generals-ancient', 'generals', 2, 'Name a general or conqueror of the ancient world.', [-500, -200], N, 500);
  V('french-louis', 'french-monarchs', 2, 'Name a French king called Louis.', [986, 1498], N, N, /^Louis/);
  V('uk-pms-1945-on', 'uk-pms', 2, 'Name a British prime minister since 1945.', [1957, 1979], 1945, N);
  V('landmarks-1800-on', 'landmarks', 2, 'Name a famous landmark built since 1800.', [1859.99, 1899.99], 1800, N);

  V('us-presidents-since-1945', 'us-presidents', 1, 'Name a US president who has taken office since 1945.', [1961, 1981], 1945, N);
  V('inventions-1900s', 'inventions', 1, 'Name an invention of the 20th century.', [1921, 1950], 1900, 1999.99);
  V('writers-1900s', 'writers', 1, 'Name a famous writer born in the 20th century.', [1911, 1930], 1900, 1999.99);
  V('painters-1800-on', 'painters', 1, 'Name a famous painter born since 1800.', [1844, 1886], 1800, N);
  V('wars-1800s', 'wars', 1, 'Name a war that began in the 19th century.', [1821, 1856], 1800, 1899.99);
  V('ships-1900s', 'ships', 1, 'Name a famous ship of the 20th century.', [1910, 1938], 1900, 1999.99);
  V('generals-1900s', 'generals', 1, 'Name a famous general of the 20th century.', [1916.4, 1941.4], 1900, 1999.99);

  V('eng-henry-edward', 'eng-monarchs', 2, 'Name an English king called Henry or Edward.', [1100, 1399], N, N, /^(Henry|Edward)\b/);
  V('battles-1500-1899', 'battles', 2, 'Name a battle fought between 1500 and 1900.', [1643, 1781], 1500, 1899.99);
  V('explorers-1600-on', 'explorers', 2, 'Name an explorer who set out in 1600 or later.', [1768.5, 1858], 1600, N);
  V('scientists-1900s', 'scientists', 2, 'Name a scientist born in the 20th century.', [1904, 1918], 1900, 1999.99);
  V('landmarks-1500-1799', 'landmarks', 2, 'Name a famous landmark built between 1500 and 1800.', [1565, 1670], 1500, 1799.99);
  V('documents-1900s', 'documents', 2, 'Name a treaty, charter or declaration of the 20th century.', [1920.6, 1951.7], 1900, 1999.99);
  V('queens-1500-on', 'queens', 2, 'Name a queen or empress who has ruled in her own right since 1500.', [1575, 1741], 1500, N);
  V('philosophers-1600-on', 'philosophers', 2, 'Name a philosopher born since 1600.', [1724, 1861], 1600, N);
  V('composers-pre1800', 'composers', 2, 'Name a composer born before 1800.', [1450, 1660], N, 1799.99);
  V('empires-1000-on', 'empires', 2, 'Name an empire founded since the year 1000.', [1206, 1464], 1000, N);
  V('revolutions-1900s', 'revolutions', 2, 'Name a revolution of the 20th century.', [1917.99, 1964], 1900, 1999.99);
  V('space-pre1975', 'space', 2, 'Name a space mission or programme launched before 1975.', [1959, 1963], N, 1974.99);

  V('uk-pms-1800s', 'uk-pms', 3, 'Name a British prime minister who first took office in the 19th century.', [1812, 1834.9], 1800, 1899.99);
  V('roman-emperors-200-on', 'roman-emperors', 3, 'Name a Roman emperor who took power in the year 200 or later.', [244, 305], 200, N);
  V('pharaohs-new-kingdom', 'pharaohs', 3, 'Name a pharaoh of the New Kingdom.', [-1479, -1319], -1550, -1070);

  // everyday knowledge
  V('consoles-nintendo', 'consoles', 1, 'Name a Nintendo console.', [1983, 1996], N, N, /Nintendo|Game Boy|Game & Watch|Color TV-Game|Virtual Boy|GameCube|^Wii/);
  V('consoles-since-2000', 'consoles', 1, 'Name a video game console released since 2000.', [2001, 2006], 2000, N);
  V('video-games-1990s', 'video-games', 1, 'Name a video game from the 1990s.', [1991, 1995], 1990, 1999.99);
  V('video-games-2000s', 'video-games', 1, 'Name a video game from the 2000s.', [2001, 2004], 2000, 2009.99);
  V('phones-pre2007', 'phones', 1, 'Name a mobile phone from before the iPhone.', [1996, 2001], N, 2006.99);
  V('disney-films-since-1989', 'disney-films', 1, 'Name a Disney animated film made since 1989 (not Pixar).', [1992, 1999], 1989, N);
  V('video-games-pre1985', 'video-games', 2, 'Name a video game from before 1985.', [1972, 1979], N, 1984.99);
  V('disney-films-pre1970', 'disney-films', 2, 'Name a Disney animated film from before 1970.', [1942, 1950], N, 1969.99);
  V('chocolate-bars-since-1950', 'chocolate-bars', 1, 'Name a chocolate bar or chocolate sweet launched since 1950.', [1960, 1976], 1950, N);
  V('soft-drinks-since-1940', 'soft-drinks', 1, 'Name a soft drink launched since 1940.', [1961, 1979], 1940, N);
  V('apple-products-since-2000', 'apple-products', 1, 'Name an Apple product line launched since 2000.', [2001, 2007], 2000, N);
  V('bond-films-since-1980', 'bond-films', 1, 'Name a James Bond film made since 1980.', [1985, 1999], 1980, N);
  V('mario-games-since-2000', 'mario-games', 1, 'Name a game with Mario in it released since 2000.', [2002, 2008], 2000, N);
  V('pixar-films-since-2010', 'pixar-films', 1, 'Name a Pixar film made since 2010.', [2012, 2017], 2010, N);

  // ======================= more names for the rolls above =======================
  // Kept apart so the rolls stay readable. M(id, roll) adds lines to a roll.
  function M(id, roll) {
    for (var i = 0; i < LISTS.length; i++) if (LISTS[i].id === id) { LISTS[i].roll += '\n' + roll; return; }
    throw new Error('no roll ' + id);
  }

  M('roman-emperors', `
Diadumenian|218.3
Herennius Etruscus|251.3
Hostilian|251.5
Volusianus|251.8|Volusian
Saloninus|260
Quintillus|270.1
Florianus|276.1|Florian
Severus II|306.5|Flavius Severus
Maximinus Daia|310|Maximinus II;Maximinus Daza
Magnus Maximus|383
Theodosius II|408
Constantius III|421
Joannes|423|Johannes
Marcian|450
Petronius Maximus|455
Avitus|455.5
Leo I|457.1|Leo the Thracian
Libius Severus|461|Severus III
Anthemius|467
Olybrius|472
Glycerius|473
Julius Nepos|474
Zeno|474.1`);

  M('eng-monarchs', `
Egbert|802|Ecgberht
Ethelwulf|839|Aethelwulf;Æthelwulf
Ethelbald|858|Aethelbald;Æthelbald
Ethelbert|860|Aethelberht;Æthelberht;Ethelberht
Ethelred I|865|Aethelred I;Æthelred I
Matilda|1141|Empress Matilda;Maud`);

  M('french-monarchs', `
Childebert I|511
Chlothar I|511.5|Clotaire I;Clothar I
Chlothar II|584|Clotaire II;Clothar II
Clovis II|639
Childeric III|743
Carloman I|768.5
John I|1316.9|John the Posthumous`);

  M('russian-tsars', `
Feodor II|1605.2|Fyodor II`);

  M('chinese-dynasties', `
Sixteen Kingdoms|304
Southern Tang|937
Western Liao|1124|Qara Khitai;Kara-Khitan
Northern Yuan|1368.5
Shun|1644.1`);

  M('pharaohs', `
Hor-Aha|~-3050|Aha
Den|~-2970
Khasekhemwy|~-2690
Huni|~-2637
Djedefre|~-2566|Radjedef
Shepseskaf|~-2503
Userkaf|~-2494
Sahure|~-2487
Djedkare|~-2414|Djedkare Isesi
Teti|~-2345.5
Pepi I|~-2332|Pepy I
Intef II|~-2112
Senusret I|~-1971|Sesostris I
Amenemhat III|~-1860
Kamose|~-1555
Nefertiti|~-1334|Neferneferuaten
Amenmesse|~-1203
Seti II|~-1203.5|Sethos II
Siptah|~-1197
Twosret|~-1191|Tausret
Setnakhte|~-1189
Ramesses IV|~-1155|Ramses IV
Ramesses VI|~-1145|Ramses VI
Ramesses IX|~-1129|Ramses IX
Ramesses XI|~-1107|Ramses XI
Psusennes I|~-1047
Osorkon II|~-872
Piye|~-744|Piankhi
Shabaka|~-705
Apries|~-589
Cambyses II|-525|Cambyses
Darius I|-522|Darius;Darius the Great
Nectanebo I|~-380
Ptolemy III|-246
Ptolemy IV|-221
Ptolemy V|-204
Ptolemy VI|-180
Ptolemy VIII|-145
Ptolemy XII|-80`);

  M('royal-houses', `
Godwin|1066|Godwinson`);

  M('mughal-emperors', `
Azam Shah|1707.2
Rafi ud-Darajat|1719.1
Shah Jahan II|1719.4
Shah Jahan III|1759`);

  M('japanese-periods', `
Kenmu Restoration|1333|Kenmu
Nanboku-cho|1336.5|Northern and Southern Courts
Bakumatsu|1853`);

  M('crusades', `
Crusade of 1101|1101
Venetian Crusade|1122
Wendish Crusade|1147.3
Livonian Crusade|1198
Prussian Crusade|1217.5
Barons' Crusade|1239
Shepherds' Crusade|1251
Aragonese Crusade|1284
Smyrniote Crusades|1343|Smyrna Crusade
Alexandrian Crusade|1365
Crusade of Nicopolis|1396|Nicopolis
Hussite Crusades|1420|Hussite Wars
Crusade of Varna|1443|Varna`);

  M('german-chancellors', `
Joseph Goebbels|1945.3
Lutz Graf Schwerin von Krosigk|1945.4|Schwerin von Krosigk;Lutz Schwerin von Krosigk;Krosigk`);

  M('wars', `
Wars of the Diadochi|-322|Diadochi Wars
Macedonian Wars|-214
Social War|-91
Mithridatic Wars|-88|Mithridatic War
Caesar's Civil War|-49|Roman Civil War
Jewish-Roman War|66|First Jewish-Roman War;Jewish War;Great Jewish Revolt
Gothic War|535
Arab-Byzantine wars|629
Reconquista|711
Norman Conquest|1066|Norman invasion
The Anarchy|1135
Genpei War|1180
First Barons' War|1215|Barons War
Second Barons' War|1264
Hussite Wars|1419
Onin War|1467
German Peasants' War|1524|Peasants War
Livonian War|1558
French Wars of Religion|1562|Wars of Religion
Imjin War|1592|Japanese invasions of Korea
Bishops' Wars|1639
Wars of the Three Kingdoms|1639.5
Fronde|1648
Franco-Dutch War|1672
King Philip's War|1675
Great Turkish War|1683
Williamite War|1689|Williamite War in Ireland
Jacobite risings|1689.6|Jacobite rising;Jacobite rebellion;Jacobite rebellions;Jacobite uprising;The Forty-Five
War of the Polish Succession|1733|Polish Succession
Carnatic Wars|1746
Anglo-Mysore Wars|1767
Russo-Turkish War|1768|Russo-Turkish Wars
War of the Bavarian Succession|1778|Bavarian Succession;Potato War
Haitian Revolution|1791
Barbary Wars|1801|First Barbary War;Barbary War
Peninsular War|1807
Spanish American wars of independence|1808|Latin American wars of independence
Seminole Wars|1816|Seminole War
Anglo-Burmese Wars|1824|Anglo-Burmese War
Texas Revolution|1835|Texas War of Independence
First Anglo-Afghan War|1839.5|Anglo-Afghan War;Anglo-Afghan Wars
Anglo-Sikh Wars|1845|Anglo-Sikh War;Sikh Wars
Schleswig Wars|1848|First Schleswig War;Second Schleswig War;Schleswig War
Italian Wars of Independence|1848.5|Italian War of Independence
Second Opium War|1856|Arrow War
Indian Rebellion|1857|Indian Mutiny;Sepoy Mutiny;Indian Rebellion of 1857
Paraguayan War|1864|War of the Triple Alliance
Boshin War|1868
Great Sioux War|1876|Sioux War;Black Hills War
War of the Pacific|1879.3
First Boer War|1880
Mahdist War|1881
Sino-French War|1884
Philippine-American War|1899.2
Mexican Revolution|1910
Italo-Turkish War|1911
Polish-Soviet War|1919.2
Turkish War of Independence|1919.4
Irish Civil War|1922|Civil War
Chaco War|1932
Second Italo-Ethiopian War|1935|Italo-Ethiopian War;Abyssinian War
Greek Civil War|1946|Civil War
First Indochina War|1946.9|Indochina War
Indo-Pakistani War|1947|Indo-Pakistani Wars;India-Pakistan War;Kashmir War
Malayan Emergency|1948.5
Mau Mau Uprising|1952|Mau Mau
Suez Crisis|1956|Suez War;Suez
Congo Crisis|1960
Portuguese Colonial War|1961
Sino-Indian War|1962
Nigerian Civil War|1967.5|Biafran War;Biafra;Civil War
The Troubles|1968
Bangladesh Liberation War|1971
Lebanese Civil War|1975|Civil War
Angolan Civil War|1975.9|Civil War
Sino-Vietnamese War|1979.1
Lebanon War|1982.4
Sri Lankan Civil War|1983|Civil War
Invasion of Grenada|1983.8|Grenada
Yugoslav Wars|1991|Yugoslav War;Croatian War of Independence;Croatian War
Chechen Wars|1994|First Chechen War;Second Chechen War;Chechen War
Congo Wars|1996|First Congo War;Second Congo War;Congo War
Eritrean-Ethiopian War|1998.4
War in Darfur|2003.1|Darfur
Russo-Georgian War|2008|Georgian War
Libyan Civil War|2011.1|Civil War
Yemeni civil war|2014.7|Civil War
Tigray War|2020`);

  M('battles', `
Megiddo|~-1457
Troy|~-1184|Siege of Troy
Leuctra|-371
Chaeronea|-338
Granicus|-334
Hydaspes|-326
Ipsus|-301
Trebia|-218
Lake Trasimene|-217|Trasimene
Carthage|-146|Siege of Carthage
Carrhae|-53
Watling Street|61
Masada|73|Siege of Masada
Mons Graupius|83
Mount Badon|~500|Badon;Badon Hill
Yarmouk|636
Qadisiyyah|636.9|al-Qadisiyyah
Guadalete|711
Talas|751
Roncevaux Pass|778|Roncevaux;Roncesvalles
Brunanburh|937
Lechfeld|955
Fulford|1066.7
Dorylaeum|1097
Antioch|1098|Siege of Antioch
Jerusalem|1099|Siege of Jerusalem
Legnano|1176
Arsuf|1191
Las Navas de Tolosa|1212|Navas de Tolosa
Ain Jalut|1260
Lewes|1264
Evesham|1265
Falkirk|1298
Golden Spurs|1302|Courtrai;Kortrijk
Sluys|1340
Neville's Cross|1346.8
Otterburn|1388
Kosovo|1389|Kosovo Polje
Nicopolis|1396
Shrewsbury|1403
Grunwald|1410|Tannenberg
Verneuil|1424
Castillon|1453.6
St Albans|1455|First Battle of St Albans
Wakefield|1460
Barnet|1471
Tewkesbury|1471.4
Stoke Field|1487|Stoke
Granada|1492|Fall of Granada
Marignano|1515
Panipat|1526.3|First Battle of Panipat
Pinkie|1547|Pinkie Cleugh
Malta|1565|Great Siege of Malta;Siege of Malta
Nagashino|1575
Kinsale|1601
White Mountain|1620
Breitenfeld|1631
Lützen|1632
Edgehill|1642
Rocroi|1643
Dunbar|1650
Worcester|1651
The Medway|1667|Raid on the Medway
Sedgemoor|1685
Killiecrankie|1689
Narva|1700
Ramillies|1706
Oudenarde|1708
Malplaquet|1709.7
Sheriffmuir|1715
Dettingen|1743
Fontenoy|1745
Prestonpans|1745.7
Rossbach|1757.8
Leuthen|1757.9
Minden|1759.6
Quiberon Bay|1759.9
Trenton|1776
Cowpens|1781.1
Valmy|1792
Marengo|1800
Copenhagen|1801
Jena|1806
Wagram|1809
Tippecanoe|1811
Salamanca|1812.5
Vitoria|1813.4
Lake Erie|1813.7
Ayacucho|1824
Navarino|1827
San Jacinto|1836.3
Blood River|1838
Buena Vista|1847
Inkerman|1854.8
Sevastopol|1854.9|Siege of Sevastopol
Solferino|1859
Shiloh|1862.2
Fredericksburg|1862.9
Chancellorsville|1863.3
Vicksburg|1863.4|Siege of Vicksburg
Chickamauga|1863.7
Königgrätz|1866|Sadowa
Khartoum|1884|Siege of Khartoum
Adwa|1896
Manila Bay|1898.3
San Juan Hill|1898.5
Mafeking|1899|Siege of Mafeking;Mafikeng
Spion Kop|1900
Mukden|1905.1
Mons|1914.6
Loos|1915.7
Vimy Ridge|1917.2|Vimy
Caporetto|1917.8
Cambrai|1917.9
Belleau Wood|1918.4
Amiens|1918.6
Warsaw|1920|Miracle on the Vistula
Shanghai|1937
Nanking|1937.9|Nanjing
Khalkhin Gol|1939
The Atlantic|1939.7
France|1940.3|Fall of France
Tobruk|1941.3|Siege of Tobruk
Crete|1941.4
Leningrad|1941.7|Siege of Leningrad
Moscow|1941.8
Singapore|1942.1|Fall of Singapore
Coral Sea|1942.3
Guadalcanal|1942.6
Monte Cassino|1944.05|Cassino
Anzio|1944.06
Imphal|1944.2|Kohima
Arnhem|1944.7|Market Garden;Operation Market Garden
Leyte Gulf|1944.8
Pusan Perimeter|1950.6|Pusan
Chosin Reservoir|1950.9|Chosin
Imjin River|1951|Imjin
Bay of Pigs|1961
Ia Drang|1965
Khe Sanh|1968
Tet Offensive|1968.1|Tet
Hue|1968.2
Hamburger Hill|1969
Goose Green|1982
Mogadishu|1993|Black Hawk Down
Tora Bora|2001
Fallujah|2004`);

  M('ww2-battles', `
The Netherlands|1940.35|Netherlands;Rotterdam
Sedan|1940.37
Arras|1940.39
Calais|1940.395|Siege of Calais
Mers-el-Kebir|1940.5
Cape Matapan|1941.24|Matapan
Greece|1941.27
Denmark Strait|1941.39|Sinking of the Bismarck;Bismarck
Smolensk|1941.52
Kiev|1941.64|Kyiv
Sevastopol|1941.83|Siege of Sevastopol
Wake Island|1941.935
Malaya|1941.936
Java Sea|1942.15
Corregidor|1942.33
Gazala|1942.4
Kokoda Track|1942.55|Kokoda
Savo Island|1942.61
Milne Bay|1942.65
Santa Cruz Islands|1942.82|Santa Cruz
Operation Torch|1942.85|Torch
Kharkov|1943.12|Kharkiv
Bismarck Sea|1943.17
Tunisia|1943.3|Tunis
Salerno|1943.69
Tarawa|1943.88
North Cape|1943.98
Narva|1944.09
Saipan|1944.45
Operation Bagration|1944.47|Bagration
Caen|1944.44
Guam|1944.55
Falaise|1944.61|Falaise Pocket;Falaise Gap
Paris|1944.63|Liberation of Paris
Peleliu|1944.71
Hurtgen Forest|1944.72|Hürtgen Forest
Aachen|1944.76
The Scheldt|1944.75
Manila|1945.09
Seelow Heights|1945.285
Vienna|1945.25
Konigsberg|1945.26|Königsberg`);

  M('ww1-battles', `
Liege|1914.59|Liège
The Frontiers|1914.6|Battle of the Frontiers
Le Cateau|1914.652
Masurian Lakes|1914.69
The Aisne|1914.7
Tanga|1914.84
Sarikamish|1914.97
Second Ypres|1915.3
Gorlice-Tarnow|1915.33
Artois|1915.35
Kut|1915.93|Siege of Kut
Lake Naroch|1916.2
Fromelles|1916.55
Pozieres|1916.56
Delville Wood|1916.54
Flers-Courcelette|1916.7
Gaza|1917.23
Chemin des Dames|1917.29|Nivelle Offensive
Hill 70|1917.62
Riga|1917.66
Beersheba|1917.83
Jerusalem|1917.9
The Lys|1918.27
Zeebrugge|1918.31|Zeebrugge Raid
Cantigny|1918.4
The Piave|1918.45|Piave
Chateau-Thierry|1918.41|Château-Thierry
Second Marne|1918.54|Second Battle of the Marne
Saint-Mihiel|1918.7|St Mihiel
Hindenburg Line|1918.73|St Quentin Canal
Vittorio Veneto|1918.81`);

  M('napoleonic-battles', `
Fleurus|1794
Montenotte|1796.28
Castiglione|1796.6
Cape St Vincent|1797.12
Camperdown|1797.78
Acre|1799.2|Siege of Acre
Aboukir|1799.56
Zurich|1799.7
Hohenlinden|1800.9
Maida|1806.5
Vimeiro|1808.63
Bailen|1808.55
Somosierra|1808.9
Zaragoza|1808.95|Siege of Zaragoza;Saragossa
Eckmuhl|1809.3|Eckmühl
Oporto|1809.36|Porto
Bussaco|1810.7
Fuentes de Onoro|1811.34|Fuentes de Oñoro
Albuera|1811.37
Badajoz|1812.25|Siege of Badajoz
Smolensk|1812.63
Maloyaroslavets|1812.81
Berezina|1812.9
Lutzen|1813.33|Lützen
Bautzen|1813.38
Dresden|1813.65
Toulouse|1814.27
Paris|1814.24
Wavre|1815.465`);

  M('civil-war-battles', `
Wilson's Creek|1861.61
Ball's Bluff|1861.8
Fort Henry|1862.1
Pea Ridge|1862.18
Glorieta Pass|1862.23
New Orleans|1862.31
Seven Pines|1862.41|Fair Oaks
Gaines' Mill|1862.49
Malvern Hill|1862.5
Second Bull Run|1862.66|Second Manassas
Harpers Ferry|1862.7
Corinth|1862.76
Perryville|1862.77
Brandy Station|1863.44
Port Hudson|1863.39
Fort Wagner|1863.54
Knoxville|1863.88
Olustee|1864.14
Fort Pillow|1864.28
Kennesaw Mountain|1864.49
The Crater|1864.58
Monocacy|1864.52
Cedar Creek|1864.8
Fort Fisher|1865.04
Bentonville|1865.21
Five Forks|1865.25
Sailor's Creek|1865.265`);

  M('empires', `
Elamite Empire|~-1500|Elam
Mitanni|~-1500|Mitanni Empire
Kushite Empire|~-744|Kush;Kingdom of Kush;Nubian Empire
Lydian Empire|~-680|Lydia
Nanda Empire|~-345
Ptolemaic Empire|-305|Ptolemaic Kingdom;Ptolemaic Egypt
Greco-Bactrian Kingdom|-256|Bactria;Bactrian
Xiongnu Empire|-209
Satavahana Empire|~-100
Gallic Empire|260
Palmyrene Empire|270|Palmyra
Western Roman Empire|395
Hephthalite Empire|~440|Hephthalites;White Huns
Tiwanaku Empire|~550
Gokturk Khaganate|552|Göktürk;Gokturks;Turkic Khaganate
Wari Empire|~600|Huari
Tang Empire|618.5|Tang dynasty
Rashidun Caliphate|632|Rashidun
Khazar Khaganate|~650.5|Khazars;Khazaria
Kanem-Bornu Empire|~700.5|Kanem;Bornu;Kanem Empire
Uyghur Khaganate|744|Uyghur Empire
Pala Empire|750.5
Rashtrakuta Empire|753
Samanid Empire|819|Samanids
Great Moravia|833|Moravia
Kievan Rus'|882|Rus
Toltec Empire|~900|Toltecs
Chimu Empire|~900.5|Chimor
Fatimid Caliphate|909|Fatimid;Fatimids
Ghaznavid Empire|977|Ghaznavids
Venetian Empire|~1000|Venice;Republic of Venice
Almoravid Empire|1040|Almoravids
Khwarazmian Empire|1077|Khwarezmian;Khwarezm
Almohad Caliphate|1121|Almohads;Almohad Empire
Angevin Empire|1154
Ayyubid Sultanate|1171|Ayyubid;Ayyubids
Benin Empire|~1180|Kingdom of Benin
Latin Empire|1204
Empire of Nicaea|1204.1
Empire of Trebizond|1204.2
Delhi Sultanate|1206.5
Golden Horde|1242
Mamluk Sultanate|1250|Mamluks;Mamluk
Ilkhanate|1256
Yuan Empire|1271|Yuan dynasty
Majapahit Empire|1293
Oyo Empire|~1300
Serbian Empire|1346|Serbia
Ayutthaya Kingdom|1351|Siam
Ming Empire|1368|Ming dynasty
Kongo|~1390|Kingdom of Kongo
Danish Empire|1536|Denmark;Danish colonial empire
Tsardom of Russia|1547|Muscovy
Omani Empire|1696|Oman
Afsharid Empire|1736
Durrani Empire|1747|Afghan Empire
Empire of Haiti|1804.5|Haiti
Sokoto Caliphate|1804.6|Sokoto
Belgian colonial empire|1885|Belgium;Belgian Empire
Nazi Germany|1933|Third Reich
Central African Empire|1976`);

  M('ancient-civs', `
Canaan|~-3500.5|Canaanites;Canaanite
Cycladic|~-3200.5|Cyclades
Troy|~-3000.5|Trojans;Trojan
Dilmun|~-3000.2
Kerma|~-2500.5
Hurrians|~-2300|Hurrian;Mitanni
Amorites|~-2000.5|Amorite
Nuragic|~-1800|Nuraghic
Lapita|~-1600
Vedic|~-1500.5|Vedic India;Indo-Aryans
Phrygia|~-1200|Phrygians;Phrygian
Lydia|~-1200.5|Lydians;Lydian
Saba|~-1200.7|Sheba;Sabaeans
Philistines|~-1175|Philistia;Philistine
Arameans|~-1100|Aramaeans;Aram
Dong Son|~-1000.5
Tartessos|~-900.5|Tartessus
Urartu|~-860
Macedon|~-808|Macedonia;Macedonians
Adena|~-800.5
Paracas|~-800.7
Thracians|~-700.5|Thrace;Thracian
Media|~-678|Medes
Dacians|~-500|Dacia;Dacian
Garamantes|~-500.5
Illyrians|~-400|Illyria;Illyrian
Yayoi|~-300
Parthia|-247|Parthians;Parthian
Xiongnu|-209
Hopewell|~-100.5
Kushan|30
Funan|~50
Ancestral Puebloans|~100.5|Anasazi;Pueblo
Tiwanaku|~110|Tiahuanaco
Champa|192
Byzantine|330|Byzantium;Byzantines;Byzantine Empire
Wari|~600|Huari
Vikings|793|Norse;Norsemen;Viking
Mississippian|~800|Cahokia
Khmer|802|Angkor;Khmer Empire
Toltec|~900|Toltecs
Chimu|~900.5
Great Zimbabwe|~1100|Zimbabwe
Rapa Nui|~1200.5|Easter Island
Mali|~1235|Mali Empire`);

  M('explorers', `
Faxian|399|Fa Xian;Fa-Hsien
Saint Brendan|~512|Brendan;Brendan the Navigator
Ahmad ibn Fadlan|921|Ibn Fadlan
Bjarni Herjolfsson|986
Thorfinn Karlsefni|1010
Giovanni da Pian del Carpine|1245|Carpini
William of Rubruck|1253|Rubruck
Rabban Bar Sauma|1275
Odoric of Pordenone|1318
Niccolo de' Conti|1419
Gil Eanes|1434
Diogo Cao|1482
Pero da Covilha|1487.5
Afonso de Albuquerque|1503
Sebastian Cabot|1508
Juan Sebastian Elcano|1519.7
Giovanni da Verrazzano|1524.5|Verrazano
Alvar Nunez Cabeza de Vaca|1527|Cabeza de Vaca
Francisco de Orellana|1541
Juan Rodriguez Cabrillo|1542
John Hawkins|1562
Alvaro de Mendana|1567
Martin Frobisher|1576
Yermak|1581|Yermak Timofeyevich
Humphrey Gilbert|1583
John Davis|1585
Thomas Cavendish|1586
Juan de Fuca|1592
Pedro Fernandes de Queiros|1605|Quiros
Luis Vaez de Torres|1606
Willem Janszoon|1606.1
Dirk Hartog|1616
Semyon Dezhnev|1648
Jacques Marquette|1673
Louis Jolliet|1673.1
William Dampier|1679.5
Louis Antoine de Bougainville|1766
Daniel Boone|1767
James Bruce|1768.5
Jean-Francois de La Perouse|1785|La Perouse;Laperouse
Alexander Mackenzie|1789
George Vancouver|1791
Zebulon Pike|1806
John Ross|1818
William Parry|1819.5|William Edward Parry
Fabian von Bellingshausen|1819.7
Hugh Clapperton|1822
Rene Caillie|1824
Jedediah Smith|1826
Charles Sturt|1828
Charles Wilkes|1838
James Clark Ross|1839
Edward Eyre|1840
John C. Fremont|1842
Kit Carson|1842.1
Ludwig Leichhardt|1844
Heinrich Barth|1850
John McDouall Stuart|1858
Samuel Baker|1861
Nikolai Przhevalsky|1867|Przewalski
John Wesley Powell|1869
Isabella Bird|1872
Adolf Erik Nordenskiold|1878
Francis Younghusband|1886.5
Gertrude Bell|1892
Mary Kingsley|1893
Sven Hedin|1893.5
Aurel Stein|1900
Percy Fawcett|1906
Frederick Cook|1907.5
Matthew Henson|1909
Hiram Bingham|1911
Douglas Mawson|1911.5
George Mallory|1921
Richard Byrd|1926
Umberto Nobile|1926.1
Charles Lindbergh|1927
Freya Stark|1927.5
Amelia Earhart|1928
Wilfred Thesiger|1945
Vivian Fuchs|1955
Jacques Piccard|1960
Alan Shepard|1961.3
John Glenn|1962
Valentina Tereshkova|1963
Buzz Aldrin|1969.1
Reinhold Messner|1978
Robert Ballard|1985`);

  M('inventions', `
Pottery|~-18000|Ceramics
Sail|~-4000|Sailing boat;Sailboat;Boat
Bronze|~-3300.5
Soap|~-2800
Glass|~-2500
Ink|~-2500.5
Lock|~-2000|Lock and key
Sundial|~-1500
Iron smelting|~-1200|Iron
Crossbow|~-650
Catapult|~-400
Aqueduct|~-312
Archimedes' screw|~-250|Archimedean screw
Water wheel|~-200.5|Waterwheel
Wheelbarrow|~100.5
Stirrup|~300
Horseshoe|~400
Porcelain|~620
Woodblock printing|~650.5|Block printing
Spinning wheel|~1000
Rocket|1232
Magnifying glass|~1250
Cannon|~1320|Gun;Firearm;Guns;Firearms
Hourglass|~1340
Toothbrush|1498
Pocket watch|1510|Watch
Pencil|1564
Flush toilet|1596|Toilet
Submarine|1620
Slide rule|1622
Mechanical calculator|1642|Calculator;Pascaline
Air pump|1650|Vacuum pump
Pressure cooker|1679
Seed drill|1701
Tuning fork|1711
Diving bell|1717
Flying shuttle|1733
Leyden jar|1745
Sextant|1757
Marine chronometer|1761|Chronometer
Carbonated water|1767|Soda water
Spinning mule|1779
Guillotine|1789
Gas lighting|1792|Gas lamp;Gas light
Lithography|1796.5
Braille|1824
Portland cement|1824.5
Lawnmower|1830.5|Lawn mower
Dynamo|1831|Electric generator;Generator
Mechanical reaper|1831.5|Reaper;Combine harvester
Propeller|1836.5|Screw propeller
Morse code|1837.5
Vulcanised rubber|1839|Vulcanized rubber;Rubber
Saxophone|1840.5
Fax machine|1843|Fax
Pneumatic tyre|1845|Tyre;Tire;Pneumatic tire
Pasteurisation|1864|Pasteurization
Antiseptic|1865|Antiseptics
Torpedo|1866
Traffic light|1868.5|Traffic lights
Margarine|1869
Celluloid|1870
Jeans|1873|Blue jeans
Internal combustion engine|1876.3|Petrol engine;Combustion engine;Engine
Microphone|1876.6
Cash register|1879.5
Electric fan|1882
Steam turbine|1884.5
Skyscraper|1885
Motorcycle|1885.5|Motorbike
Contact lenses|1887|Contact lens
Ballpoint pen|1888|Biro;Pen
Roll film|1888.5|Kodak camera
Electric kettle|1891|Kettle
Escalator|1892
Tractor|1892.5
Toaster|1893.2
Aspirin|1897
Tape recorder|1898
Paperclip|1899|Paper clip
Airship|1900|Zeppelin;Blimp
Safety razor|1901.5|Razor
Windscreen wiper|1903.5|Windshield wiper
Tea bag|1904|Teabag
Cellophane|1908
Neon lamp|1910|Neon light;Neon sign
Assembly line|1913.5|Production line
Sonar|1915.5
Insulin|1921
Frozen food|1924
Liquid-fuel rocket|1926
Iron lung|1928.2
Sliced bread|1928.5
Sticky tape|1930|Sellotape;Scotch tape;Adhesive tape
Electron microscope|1931
Electric guitar|1931.5
Cat's eyes|1934|Cat's eye
Parking meter|1935.2
Nylon|1935.5
Photocopier|1938|Xerox;Photocopy
Teflon|1938.5
Aerosol spray|1941|Aerosol
Aqualung|1943|Scuba;Scuba gear
Velcro|1948
LP record|1948.5|Vinyl record;Long-playing record;Vinyl
Barcode|1952
Solar cell|1954|Solar panel;Solar panels
Hovercraft|1955
Video recorder|1956|Videotape;VCR
Pacemaker|1958.5
Seat belt|1959|Seatbelt
LED|1962|Light-emitting diode
Cassette tape|1963|Cassette;Audio cassette
Computer mouse|1964|Mouse
ATM|1967|Cash machine;Cashpoint
Pocket calculator|1967.5
Microprocessor|1971.5
Video game|1972|Video games;Pong
Rubik's Cube|1974.5
Digital camera|1975
MRI scanner|1977|MRI
Post-it note|1977.5|Post-it;Post-it notes;Sticky notes
Walkman|1979
3D printing|1984|3D printer
DNA fingerprinting|1984.5|DNA profiling
MP3|1993
DVD|1995
USB|1996
Wi-Fi|1997|Wifi
Bluetooth|1998
Blockchain|2008|Bitcoin`);

  M('landmarks', `
Carnac stones|~-4500|Carnac
Ggantija|~-3600
Skara Brae|~-3180
Avebury|~-2850
Step Pyramid of Djoser|~-2670|Step Pyramid;Pyramid of Djoser;Saqqara
Mohenjo-daro|~-2500.5
Ziggurat of Ur|~-2100|Great Ziggurat of Ur;Ziggurat
Karnak|~-2000|Karnak Temple
Knossos|~-1900|Palace of Knossos
Valley of the Kings|~-1539
Luxor Temple|~-1400|Luxor
Lion Gate|~-1250|Mycenae
Roman Forum|~-600.5|Forum
Hanging Gardens of Babylon|~-600|Hanging Gardens
Circus Maximus|~-550.5
Temple of Artemis|~-550|Temple of Artemis at Ephesus
Persepolis|~-518
Nazca Lines|~-500|Nazca
Statue of Zeus|~-435|Statue of Zeus at Olympia
Mausoleum at Halicarnassus|~-351|Mausoleum of Halicarnassus
Theatre of Epidaurus|~-340|Epidaurus
Appian Way|-312|Via Appia
Colossus of Rhodes|~-280
Lighthouse of Alexandria|~-279|Pharos of Alexandria;Pharos
Great Stupa at Sanchi|~-250|Sanchi;Sanchi Stupa
Ajanta Caves|~-200|Ajanta
Masada|~-30
Western Wall|~-19|Wailing Wall
Verona Arena|30|Arena di Verona
Roman Baths|~60
Aqueduct of Segovia|~100|Segovia Aqueduct
Trajan's Column|113
Library of Celsus|~114|Ephesus
Castel Sant'Angelo|139|Mausoleum of Hadrian
Baths of Caracalla|216
Arch of Constantine|315
Church of the Holy Sepulchre|335|Holy Sepulchre
Sigiriya|~477
Bamiyan Buddhas|~550|Buddhas of Bamiyan
Horyu-ji|607
Great Mosque of Kairouan|670
Al-Aqsa Mosque|705|Al-Aqsa
Leshan Giant Buddha|713|Leshan Buddha
Umayyad Mosque|715|Great Mosque of Damascus
Todai-ji|752
Mosque of Cordoba|785|Mezquita;Great Mosque of Cordoba;Cordoba Mosque
Aachen Cathedral|796
Prambanan|~850
Prague Castle|~870
Bagan|~1050
St Mark's Basilica|1063|St Marks;Saint Mark's;San Marco
Warwick Castle|1068
Durham Cathedral|1093
Great Zimbabwe|~1100.5
Krak des Chevaliers|1142
Mesa Verde|~1190
Qutub Minar|1193|Qutb Minar
Lalibela|~1200
London Bridge|1209
Reims Cathedral|1211
Salisbury Cathedral|1220
York Minster|1220.5
Amiens Cathedral|1220.7
Sainte-Chapelle|1242
Konark Sun Temple|~1250.5|Konark
Caernarfon Castle|1283|Caernarvon Castle
Palazzo Vecchio|1299
Doge's Palace|1340
Ponte Vecchio|1345
Galata Tower|1348
Bastille|1370
Milan Cathedral|1386|Duomo di Milano
Gyeongbokgung|1395
Golden Pavilion|1397|Kinkaku-ji;Kinkakuji
Seville Cathedral|1401
Prague Astronomical Clock|1410|Astronomical Clock;Orloj
Registan|1417
Temple of Heaven|1420.5
Topkapi Palace|1459|Topkapi
Belem Tower|1514|Tower of Belem
Hampton Court Palace|1514.5|Hampton Court
Chateau de Chambord|1519|Chambord
Suleymaniye Mosque|1550
Uffizi|1560|Uffizi Gallery
El Escorial|1563|Escorial
Humayun's Tomb|1565
Fatehpur Sikri|1571
Pont Neuf|1578
Osaka Castle|1583
Charminar|1591.5
Globe Theatre|1599|Shakespeare's Globe;The Globe
Manneken Pis|1619
Les Invalides|1670|Invalides
Blenheim Palace|1705
Peterhof|1714|Peterhof Palace
Spanish Steps|1723
Schonbrunn Palace|1743|Schönbrunn
Sanssouci|1745
Liberty Bell|1752
Independence Hall|1753
British Museum|1753.5
Winter Palace|1754|Hermitage
Pantheon in Paris|1758|Paris Pantheon
Royal Crescent|1767
Monticello|1772
La Scala|1778
Iron Bridge|1779|Ironbridge
Royal Pavilion|1787|Brighton Pavilion
Hawa Mahal|1799
US Capitol|1800|Capitol;Capitol Building;United States Capitol
Bolshoi Theatre|1825|Bolshoi
Washington Monument|1848
Chain Bridge|1849|Szechenyi Chain Bridge
Crystal Palace|1851
Royal Albert Hall|1871|Albert Hall
Sacre-Coeur|1875|Sacré-Cœur
Opera Garnier|1875.1|Palais Garnier;Paris Opera
Moulin Rouge|1889.5
Forth Bridge|1890
Reichstag|1894.5
Blackpool Tower|1894.7
Flatiron Building|1902|Flatiron
Hungarian Parliament|1904
Victoria Falls Bridge|1905
Grand Central Terminal|1913|Grand Central;Grand Central Station
Little Mermaid|1913.5
Wembley Stadium|1923.5|Wembley
Gateway of India|1924
Chrysler Building|1930
India Gate|1931.2
Sydney Harbour Bridge|1932|Harbour Bridge
Battersea Power Station|1933
Pentagon|1943
Jefferson Memorial|1943.5
Atomium|1958
Tokyo Tower|1958.5
Guggenheim Museum|1959|Guggenheim
Space Needle|1962
Motherland Calls|1967
Berlin TV Tower|1969|Fernsehturm
Aswan Dam|1970|Aswan High Dam
World Trade Center|1973.2|Twin Towers
Willis Tower|1973.5|Sears Tower
Pompidou Centre|1977|Centre Pompidou
Lotus Temple|1986
Louvre Pyramid|1989
Channel Tunnel|1994|Chunnel;Eurotunnel
Guggenheim Bilbao|1997
Petronas Towers|1998|Petronas Twin Towers
Angel of the North|1998.5
Burj Al Arab|1999
Millennium Dome|1999.5|The O2;O2 Arena
Eden Project|2001
The Gherkin|2003|30 St Mary Axe
Taipei 101|2004
Millau Viaduct|2004.5
Three Gorges Dam|2006
Bird's Nest|2008|Beijing National Stadium
Marina Bay Sands|2010.5
Tokyo Skytree|2012.5|Skytree
One World Trade Center|2014|Freedom Tower
Statue of Unity|2018`);

  M('scientists', `
Anaximander|~-610
Democritus|~-460.5
Theophrastus|~-371
Aristarchus of Samos|~-310|Aristarchus
Hipparchus|~-190
Hero of Alexandria|~10|Hero;Heron
Pliny the Elder|23|Pliny
Zhang Heng|78
Aryabhata|476
Brahmagupta|598
Al-Razi|~865|Rhazes
Al-Biruni|973|Biruni
Omar Khayyam|1048
Fibonacci|~1170|Leonardo of Pisa
Albertus Magnus|~1200
Ibn al-Nafis|1213
Georgius Agricola|1494
William Gilbert|1544
John Napier|1550
Pierre de Fermat|1607
Evangelista Torricelli|1608
Giovanni Cassini|1625
John Ray|1627.9
Nicolas Steno|1638
Jacob Bernoulli|1655
Daniel Bernoulli|1700
James Hutton|1726
Joseph Black|1728
Joseph-Louis Lagrange|1736.1
Charles-Augustin de Coulomb|1736.5|Coulomb
Luigi Galvani|1737
Carl Wilhelm Scheele|1742
Jean-Baptiste Lamarck|1744
Pierre-Simon Laplace|1749.3
Caroline Herschel|1750
Georges Cuvier|1769
Thomas Young|1773
Amedeo Avogadro|1776
Hans Christian Oersted|1777.6|Ørsted;Orsted
Mary Somerville|1780
Joseph von Fraunhofer|1787
Augustin-Jean Fresnel|1788
Sadi Carnot|1796
Joseph Henry|1797.9
Mary Anning|1799
Friedrich Wohler|1800|Wöhler
Justus von Liebig|1803
Richard Owen|1804
Louis Agassiz|1807
Theodor Schwann|1810
Robert Bunsen|1811
Ignaz Semmelweis|1818.5
Leon Foucault|1819
Florence Nightingale|1820
Hermann von Helmholtz|1821
Rudolf Virchow|1821.8
Francis Galton|1822.1
Alfred Russel Wallace|1823
Gustav Kirchhoff|1824.2
Thomas Henry Huxley|1825|T. H. Huxley
August Kekule|1829|Kekulé
Ernst Mach|1838
Josiah Willard Gibbs|1839
Camillo Golgi|1843.5
Ludwig Boltzmann|1844
Henri Becquerel|1852
Albert Michelson|1852.9
Hendrik Lorentz|1853
Henri Poincare|1854|Poincaré
Paul Ehrlich|1854.2
J. J. Thomson|1856.9
Svante Arrhenius|1859
Pierre Curie|1859.4
William Henry Bragg|1862
George Washington Carver|~1864
Karl Landsteiner|1868
Fritz Haber|1868.9
Carl Jung|1875
Lise Meitner|1878
Otto Hahn|1879.2
Alfred Wegener|1880
Emmy Noether|1882
Max Born|1882.9
Srinivasa Ramanujan|1887.9
C. V. Raman|1888
Lawrence Bragg|1890
Frederick Banting|1891
James Chadwick|1891.8
Louis de Broglie|1892|de Broglie
Satyendra Nath Bose|1894
Jean Piaget|1896
Wolfgang Pauli|1900
Linus Pauling|1901.1
Barbara McClintock|1902.4
John von Neumann|1903|von Neumann
Konrad Lorenz|1903.8
Louis Leakey|1903.6
B. F. Skinner|1904.2
Kurt Godel|1906|Gödel
Hans Bethe|1906.5
Grace Hopper|1906.9
Edward Teller|1908
William Shockley|1910.1
Subrahmanyan Chandrasekhar|1910.8
Chien-Shiung Wu|1912.4
Bernard Lovell|1913
Mary Leakey|1913.1
Fred Hoyle|1915
Maurice Wilkins|1916.9
Frederick Sanger|1918.6
James Lovelock|1919
David Attenborough|1926
Vera Rubin|1928.5
Murray Gell-Mann|1929.7
E. O. Wilson|1929.4
Tu Youyou|1930
Roger Penrose|1931
Dian Fossey|1932
Oliver Sacks|1933
Kip Thorne|1940
Richard Dawkins|1941
Stephen Jay Gould|1941.7
Jocelyn Bell Burnell|1943|Bell Burnell
Craig Venter|1946
Neil deGrasse Tyson|1958
Jennifer Doudna|1964
Brian Cox|1968`);

  M('writers', `
Hesiod|~-750
Pindar|~-518
Thucydides|~-460
Xenophon|~-430
Catullus|~-84
Livy|-59
Seneca|~-4
Plutarch|~46
Juvenal|~55
Tacitus|~56
Apuleius|~124
Kalidasa|~400
Bede|~672
Du Fu|712
Ferdowsi|~940|Firdausi
Sei Shonagon|~966
Chretien de Troyes|~1135
Marie de France|~1160
Snorri Sturluson|1179|Snorri
Hafez|~1325|Hafiz
William Langland|~1332
Julian of Norwich|~1343.5
Christine de Pizan|1364
Francois Villon|~1431
Erasmus|1466
Ludovico Ariosto|1474
William Tyndale|~1494.5
Michel de Montaigne|1533
Edmund Spenser|~1552
Philip Sidney|1554
Francis Bacon|1561
Lope de Vega|1562
John Webster|~1580
Robert Herrick|1591
Pierre Corneille|1606
Andrew Marvell|1621
Jean de La Fontaine|1621.5|La Fontaine
John Dryden|1631
Jean Racine|1639
Aphra Behn|~1640
Matsuo Basho|1644|Basho
William Congreve|1670
Alexander Pope|1688
Samuel Richardson|1689
Henry Fielding|1707
Laurence Sterne|1713
Thomas Gray|1716
Oliver Goldsmith|1728
James Boswell|1740
Richard Brinsley Sheridan|1751
Fanny Burney|1752
Friedrich Schiller|1759.9
Ann Radcliffe|1764
Stendhal|1783
Washington Irving|1783.3
James Fenimore Cooper|1789
Heinrich Heine|1797.9
Nathaniel Hawthorne|1804
Elizabeth Barrett Browning|1806
Henry Wadsworth Longfellow|1807
Nikolai Gogol|1809.2
Elizabeth Gaskell|1810
William Makepeace Thackeray|1811
Robert Browning|1812.4
Anthony Trollope|1815
Ivan Turgenev|1818.9
Anne Bronte|1820
Charles Baudelaire|1821.3
Wilkie Collins|1824
Henrik Ibsen|1828.2
Christina Rossetti|1830.9
Emile Zola|1840.3
Henry James|1843
Bram Stoker|1847
Guy de Maupassant|1850.6|Maupassant
Arthur Rimbaud|1854.8
L. Frank Baum|1856.4
Edith Nesbit|1858|E. Nesbit
Kenneth Grahame|1859.2
J. M. Barrie|1860.4
Rabindranath Tagore|1861
Edith Wharton|1862
Luigi Pirandello|1867
Maxim Gorky|1868
Thomas Mann|1875
Rainer Maria Rilke|1875.9
Hermann Hesse|1877
E. M. Forster|1879
P. G. Wodehouse|1881
Lu Xun|1881.7
A. A. Milne|1882.05
Arthur Ransome|1884
Ezra Pound|1885.8
Siegfried Sassoon|1886
Raymond Chandler|1888.5
Katherine Mansfield|1888.8
Boris Pasternak|1890.1
H. P. Lovecraft|1890.6
Zora Neale Hurston|1891
Dorothy L. Sayers|1893.4
Wilfred Owen|1893.2
Aldous Huxley|1894
Robert Graves|1895
Enid Blyton|1897.6
Bertolt Brecht|1898.1
Federico Garcia Lorca|1898.4|Lorca
E. B. White|1899.5
Antoine de Saint-Exupery|1900|Saint-Exupéry;Saint Exupery
Langston Hughes|1901
Evelyn Waugh|1903.8
Graham Greene|1904
Pablo Neruda|1904.5
Dr. Seuss|1904.2|Theodor Geisel;Seuss
Jean-Paul Sartre|1905
Ayn Rand|1905.1
W. H. Auden|1907
Daphne du Maurier|1907.4|du Maurier
Astrid Lindgren|1907.9
Simone de Beauvoir|1908.05|de Beauvoir
William Golding|1911
Tennessee Williams|1911.2
Naguib Mahfouz|1911.9
Dylan Thomas|1914
Ralph Ellison|1914.2
Tove Jansson|1914.6
Arthur Miller|1915
Saul Bellow|1915.4
Anthony Burgess|1917
Arthur C. Clarke|1917.9
Aleksandr Solzhenitsyn|1918|Alexander Solzhenitsyn
Primo Levi|1919.6
Ray Bradbury|1920.6
Frank Herbert|1920.8
Jack Kerouac|1922
Kurt Vonnegut|1922.8
Philip Larkin|1922.6
Joseph Heller|1923
Italo Calvino|1923.8
James Baldwin|1924
Truman Capote|1924.7
Yukio Mishima|1925
Allen Ginsberg|1926.4
Gunter Grass|1927.8|Günter Grass
Philip K. Dick|1928.9
Ursula K. Le Guin|1929|Le Guin
Milan Kundera|1929.2
Anne Frank|1929.4
Harold Pinter|1930.8
Ted Hughes|1930.6
John le Carre|1931.8|le Carré
V. S. Naipaul|1932.6
John Updike|1932.2
Umberto Eco|1932.01
Philip Roth|1933
Cormac McCarthy|1933.5
Wole Soyinka|1934
Seamus Heaney|1939.3
Isabel Allende|1942
Michael Morpurgo|1943
Alice Walker|1944
Bernard Cornwell|1944.1
Jacqueline Wilson|1945
Philip Pullman|1946
Paulo Coelho|1947.6
Ian McEwan|1948.4
George R. R. Martin|1948.7|George RR Martin
Julia Donaldson|1948.69
Ken Follett|1949.4
Hilary Mantel|1952
Douglas Adams|1952.2
Orhan Pamuk|1952.4
John Grisham|1955
Neil Gaiman|1960
Suzanne Collins|1962
Dan Brown|1964
Zadie Smith|1975
Chimamanda Ngozi Adichie|1977|Chimamanda Adichie`);

  M('painters', `
Cimabue|~1240
Duccio|~1255
Simone Martini|~1284
Andrei Rublev|~1360
Paolo Uccello|1397
Rogier van der Weyden|~1399|van der Weyden
Filippo Lippi|~1406
Giovanni Bellini|~1430
Hans Memling|~1430.5
Andrea Mantegna|~1431
Pietro Perugino|~1446
Domenico Ghirlandaio|1448
Matthias Grunewald|~1470|Grünewald
Lucas Cranach the Elder|1472|Cranach;Lucas Cranach
Giorgione|~1477
Correggio|1489
Parmigianino|1503
Giuseppe Arcimboldo|1526
Paolo Veronese|1528
Annibale Carracci|1560
Frans Hals|~1582
Georges de La Tour|1593.2|de La Tour
Nicolas Poussin|1594
Francisco de Zurbaran|1598|Zurbarán
Claude Lorrain|~1600
Bartolome Esteban Murillo|1617|Murillo
Jan Steen|~1626
Jacob van Ruisdael|~1628|van Ruisdael
Pieter de Hooch|1629|de Hooch
Antoine Watteau|1684
Giovanni Battista Tiepolo|1696
Jean-Baptiste-Simeon Chardin|1699|Chardin
Francois Boucher|1703
Joshua Reynolds|1723
George Stubbs|1724
Jean-Honore Fragonard|1732
Joseph Wright of Derby|1734|Joseph Wright;Wright of Derby
Elisabeth Vigee Le Brun|1755|Vigée Le Brun;Vigee Le Brun
Jean-Auguste-Dominique Ingres|1780|Ingres
Theodore Gericault|1791|Géricault
Camille Corot|1796
Utagawa Hiroshige|1797|Hiroshige
Honore Daumier|1808
Jean-Francois Millet|1814
Gustave Courbet|1819
Gustave Moreau|1826
William Holman Hunt|1827
Dante Gabriel Rossetti|1828
John Everett Millais|1829
Camille Pissarro|1830
Edward Burne-Jones|1833
Winslow Homer|1836
Alfred Sisley|1839.8
Odilon Redon|1840.3
Berthe Morisot|1841.05
Mary Cassatt|1844.4
Ilya Repin|1844.6
Raja Ravi Varma|1848.3
John Singer Sargent|1856
Alphonse Mucha|1860
Walter Sickert|1860.4
Paul Signac|1863.9
Pierre Bonnard|1867
Emil Nolde|1867.6
Edouard Vuillard|1868
Gwen John|1876
Raoul Dufy|1877
Laura Knight|1877.6
Augustus John|1878
Kazimir Malevich|1879.1
Franz Marc|1880
Ernst Ludwig Kirchner|1880.3
Andre Derain|1880.5
Fernand Leger|1881.1
Georges Braque|1882.3
Oskar Kokoschka|1886.2
Marcel Duchamp|1887.5
Giorgio de Chirico|1888|de Chirico
Paul Nash|1889
Egon Schiele|1890
Max Ernst|1891.2
Otto Dix|1891.9
Grant Wood|1891.1
Stanley Spencer|1891.5
Norman Rockwell|1894
M. C. Escher|1898.5
Tamara de Lempicka|1898.4|de Lempicka
Yves Tanguy|1900
Willem de Kooning|1904.3|de Kooning
Barnett Newman|1905
Lee Krasner|1908
Franz Kline|1910
Andrew Wyeth|1917
Robert Rauschenberg|1925
Beryl Cook|1926
Yves Klein|1928.3
Cy Twombly|1928.4
Helen Frankenthaler|1928.9
Yayoi Kusama|1929
Jasper Johns|1930
Bridget Riley|1931
Gerhard Richter|1932
Peter Blake|1932.5
Paula Rego|1935
Frank Stella|1936
Bob Ross|1942
Jack Vettriano|1951
Keith Haring|1958
Peter Doig|1959
Takashi Murakami|1962
Damien Hirst|1965
Jenny Saville|1970
Kehinde Wiley|1977`);

  M('composers', `
Perotin|~1160|Pérotin
Guillaume Dufay|~1397|Du Fay
Johannes Ockeghem|~1410
Orlando di Lasso|~1532|Lassus;Orlande de Lassus
Tomas Luis de Victoria|~1548|Victoria
John Dowland|1563
Carlo Gesualdo|1566
Orlando Gibbons|1583
Girolamo Frescobaldi|1583.7
Heinrich Schutz|1585|Schütz
Barbara Strozzi|1619
Dieterich Buxtehude|~1637
Marc-Antoine Charpentier|1643
Alessandro Scarlatti|1660
Francois Couperin|1668
Tomaso Albinoni|1671
Jean-Philippe Rameau|1683
Giovanni Battista Pergolesi|1710
C. P. E. Bach|1714.2|Carl Philipp Emanuel Bach
Leopold Mozart|1719
Johann Christian Bach|1735|J. C. Bach
Luigi Boccherini|1743
Antonio Salieri|1750
Muzio Clementi|1752
Luigi Cherubini|1760
Johann Nepomuk Hummel|1778
John Field|1782.5
Giacomo Meyerbeer|1791
Vincenzo Bellini|1801
Johann Strauss I|1804.2|Johann Strauss the Elder
Mikhail Glinka|1804.4
Fanny Mendelssohn|1805
Charles Gounod|1818
Cesar Franck|1822
Alexander Borodin|1833.8
Leo Delibes|1836
Max Bruch|1838.05
Emmanuel Chabrier|1841.05
Hubert Parry|1848
Charles Villiers Stanford|1852
Engelbert Humperdinck|1854.6
Leos Janacek|1854.5
John Philip Sousa|1854.8
Ruggero Leoncavallo|1857.3
Ethel Smyth|1858.3
Isaac Albeniz|1860.4
Hugo Wolf|1860.2
Frederick Delius|1862.05
Pietro Mascagni|1863
Carl Nielsen|1865.4
Paul Dukas|1865.7
Amy Beach|1867
Alexander Scriabin|1872.05
Charles Ives|1874.8
Samuel Coleridge-Taylor|1875.6|Coleridge-Taylor
Manuel de Falla|1876|de Falla
Ottorino Respighi|1879
Zoltan Kodaly|1882.9
Percy Grainger|1882.5
Anton Webern|1883
Alban Berg|1885
Heitor Villa-Lobos|1887|Villa-Lobos
Florence Price|1887.3
Bohuslav Martinu|1890
Arthur Honegger|1892
Darius Milhaud|1892.6
Lili Boulanger|1893
Carl Orff|1895
Paul Hindemith|1895.8
Francis Poulenc|1899
Kurt Weill|1900.2
Joaquin Rodrigo|1901
William Walton|1902
Aram Khachaturian|1903
Michael Tippett|1905
Olivier Messiaen|1908
Samuel Barber|1910
John Cage|1912
Witold Lutoslawski|1913.05
Astor Piazzolla|1921
Gyorgy Ligeti|1923
Pierre Boulez|1925
Karlheinz Stockhausen|1928
Ennio Morricone|1928.8
Stephen Sondheim|1930
Krzysztof Penderecki|1933
Arvo Part|1935|Pärt
Steve Reich|1936
John Tavener|1944
Karl Jenkins|1944.1
John Rutter|1945
Howard Shore|1946
John Adams|1947
Andrew Lloyd Webber|1948|Lloyd Webber
Joe Hisaishi|1950
Danny Elfman|1953
James Horner|1953.6
Ludovico Einaudi|1955
Max Richter|1966
Eric Whitacre|1970`);

  M('generals', `
Hammurabi|~-1792
Ashurbanipal|-668
Nebuchadnezzar II|-605|Nebuchadnezzar
Tomyris|~-530
Darius the Great|-522|Darius;Darius I
Miltiades|-490
Artemisia|-480.2|Artemisia of Caria
Epaminondas|-371
Philip II of Macedon|-359|Philip of Macedon;Philip II
Seleucus|-321|Seleucus I
Ashoka|~-268|Asoka;Ashoka the Great
Hamilcar Barca|-247|Hamilcar
Fabius Maximus|-217|Fabius
Crassus|-71
Augustus|-43|Octavian
Agrippa|-31|Marcus Agrippa
Germanicus|14
Titus|70
Agricola|77
Septimius Severus|193
Zenobia|270
Aurelian|270.5
Constantine the Great|306|Constantine
Alaric|395|Alaric the Goth
Stilicho|395.5
Aetius|425|Flavius Aetius
Genseric|428|Gaiseric
Clovis|481|Clovis I
Theodoric the Great|488|Theodoric
Heraclius|610
Tariq ibn Ziyad|711|Tariq
Alfred the Great|871|Alfred
Rollo|911
Aethelflaed|911.5|Æthelflæd;Ethelfleda;Lady of the Mercians
Otto the Great|936|Otto I
Basil II|976
Mahmud of Ghazni|998
Cnut|1015|Canute;Cnut the Great
Harald Hardrada|1030
Robert Guiscard|1047
Godfrey of Bouillon|1096
Bohemond|1096.1|Bohemond of Taranto
Frederick Barbarossa|1155|Barbarossa
Minamoto no Yoritomo|1180|Yoritomo
Minamoto no Yoshitsune|1180.2|Yoshitsune
Subutai|1211|Subotai
Batu Khan|1236|Batu
Alexander Nevsky|1240
Hulagu Khan|1256|Hulagu
Baibars|1260.5
Edward I|1277|Edward Longshanks;Longshanks
Edward III|1337
Bertrand du Guesclin|1356|du Guesclin
Jan Zizka|1419|Žižka
John Hunyadi|1441|Hunyadi
Skanderbeg|1443
Vlad the Impaler|1456|Vlad Tepes;Vlad III;Dracula
Gonzalo de Cordoba|1495|El Gran Capitan
Selim I|1512|Selim the Grim
Duke of Alba|1547
Ivan the Terrible|1552|Ivan IV
Takeda Shingen|1553
Maurice of Nassau|1590
Yi Sun-sin|1592|Admiral Yi
Count of Tilly|1620|Tilly
Albrecht von Wallenstein|1625|Wallenstein
Prince Rupert|1642.2|Rupert of the Rhine
Thomas Fairfax|1642.4
Turenne|1643
Jan Sobieski|1673|John III Sobieski;Sobieski
Prince Eugene of Savoy|1697|Eugene of Savoy;Prince Eugene
Charles XII|1700.5|Charles XII of Sweden
Nader Shah|1729
Maurice de Saxe|1745
Robert Clive|1751|Clive of India
Marquis de Montcalm|1756|Montcalm
James Wolfe|1759|General Wolfe
Alexander Suvorov|1768
Benedict Arnold|1775.2
Nathanael Greene|1775.4
Charles Cornwallis|1776|Lord Cornwallis
Marquis de Lafayette|1777|Lafayette
Toussaint Louverture|1791|Toussaint L'Ouverture
Michel Ney|1799|Marshal Ney
Mikhail Kutuzov|1805
Tecumseh|1811
Gebhard von Blucher|1813.5|Blücher;Marshal Blucher
Jose de San Martin|1813.8|San Martín
Andrew Jackson|1814
Sam Houston|1836
Antonio Lopez de Santa Anna|1836.1|Santa Anna
Zachary Taylor|1846
Winfield Scott|1847
Lord Raglan|1854
Rani of Jhansi|1857|Lakshmibai;Rani Lakshmibai
Charles Gordon|1860|Gordon of Khartoum;General Gordon
George McClellan|1861.7
J. E. B. Stuart|1861.8|Jeb Stuart
Philip Sheridan|1862
George Meade|1863
Helmuth von Moltke|1866|Moltke;Moltke the Elder
Crazy Horse|1876.2
Geronimo|1876.5
Chief Joseph|1877
Lord Roberts|1878|Frederick Roberts
Cetshwayo|1879
Lord Kitchener|1896|Kitchener;Herbert Kitchener
Robert Baden-Powell|1899|Baden-Powell
Togo Heihachiro|1904|Admiral Togo;Togo
Paul von Hindenburg|1914.1|Hindenburg
Erich Ludendorff|1914.2
Joseph Joffre|1914.3
Mustafa Kemal Ataturk|1915.5|Atatürk;Mustafa Kemal;Kemal Ataturk
Philippe Petain|1916.2|Pétain
Aleksei Brusilov|1916.4
Edmund Allenby|1917.5
John Monash|1918
Carl Gustaf Mannerheim|1918.2|Mannerheim
Leon Trotsky|1918.4
Chiang Kai-shek|1926
Francisco Franco|1936
George Marshall|1939
Heinz Guderian|1939.7
Erich von Manstein|1940.3|Manstein
Hugh Dowding|1940.6
Archibald Wavell|1940.9
Chester Nimitz|1941.95
Josip Broz Tito|1941.4|Tito
Tomoyuki Yamashita|1941.93
Konstantin Rokossovsky|1941.6
Ivan Konev|1941.7
William Slim|1942.1|Bill Slim
William Halsey|1942.3|Bull Halsey
Arthur Harris|1942.15|Bomber Harris
Vasily Chuikov|1942.7
Harold Alexander|1942.6
Omar Bradley|1943
Louis Mountbatten|1943.6|Lord Mountbatten
Matthew Ridgway|1950
Moshe Dayan|1956.8
Fidel Castro|1956.9
William Westmoreland|1964
Colin Powell|1989
David Petraeus|2003`);

  M('philosophers', `
Anaximander|~-610
Mahavira|~-599
Anaximenes|~-586
Xenophanes|~-570.5
Anaxagoras|~-500
Empedocles|~-494
Protagoras|~-490.5
Gorgias|~-483
Mozi|~-470.5|Mo Tzu
Antisthenes|~-445
Theophrastus|~-371
Pyrrho|~-360
Xunzi|~-310
Han Feizi|~-280|Han Fei
Chrysippus|~-279
Philo of Alexandria|~-20|Philo
Plutarch|~46
Nagarjuna|~150
Sextus Empiricus|~160
Origen|~185
Porphyry|~234
Hypatia|~360
Proclus|412
Adi Shankara|~788|Shankara
Al-Kindi|~801
Al-Farabi|~872
Al-Ghazali|~1058|Ghazali
Peter Abelard|1079|Abelard
Zhu Xi|1130
Ibn Arabi|1165
Dogen|1200
Roger Bacon|~1219
Bonaventure|1221
Meister Eckhart|~1260
Duns Scotus|~1266
Ibn Khaldun|1332
Nicholas of Cusa|1401
Marsilio Ficino|1433
Pico della Mirandola|1463
Wang Yangming|1472
Giordano Bruno|1548
Francisco Suarez|1548.1
Hugo Grotius|1583
Pierre Gassendi|1592
Nicolas Malebranche|1638
Giambattista Vico|1668
Christian Wolff|1679
Thomas Reid|1710
Denis Diderot|1713
Thomas Paine|1737
Johann Gottfried Herder|1744
Johann Gottlieb Fichte|1762
Friedrich Schelling|1775
Auguste Comte|1798
Ralph Waldo Emerson|1803
Ludwig Feuerbach|1804
Henry David Thoreau|1817
Herbert Spencer|1820.3
Franz Brentano|1838
Charles Sanders Peirce|1839
Gottlob Frege|1848
Edmund Husserl|1859.3
Henri Bergson|1859.8
John Dewey|1859.9
Alfred North Whitehead|1861
George Santayana|1863
Kitaro Nishida|1870
G. E. Moore|1873
Muhammad Iqbal|1877
Karl Jaspers|1883
Antonio Gramsci|1891
Walter Benjamin|1892
Herbert Marcuse|1898
Gilbert Ryle|1900
Theodor Adorno|1903
Ayn Rand|1905.1
Maurice Merleau-Ponty|1908.2|Merleau-Ponty
Simone Weil|1909
Isaiah Berlin|1909.4
A. J. Ayer|1910
Iris Murdoch|1919
Thomas Kuhn|1922
Frantz Fanon|1925
Jurgen Habermas|1929|Jürgen Habermas
Jacques Derrida|1930
Richard Rorty|1931
Thomas Nagel|1937
Saul Kripke|1940
Daniel Dennett|1942
Derek Parfit|1942.9
Roger Scruton|1944
Peter Singer|1946
Martha Nussbaum|1947
Slavoj Zizek|1949|Žižek
Judith Butler|1956`);

  M('eras', `
Prehistory|~-3300000|Prehistoric;Prehistoric era
Old Kingdom|~-2686|Old Kingdom of Egypt
Middle Kingdom|~-2055
New Kingdom|~-1550
Vedic period|~-1500
Archaic Greece|~-800.5|Archaic period;Archaic
Spring and Autumn period|-771
Roman Republic|-509
Warring States period|-475|Warring States
Roman Empire|-27.5|Imperial Rome
Three Kingdoms|220
Byzantine era|330|Byzantine
Migration Period|~375|Barbarian invasions
Anglo-Saxon period|~450|Anglo-Saxon;Anglo-Saxon England
Carolingian Renaissance|~780|Carolingian
Heian period|794
Norman period|1066|Norman;Normans
Plantagenet period|1154|Plantagenet
Late Middle Ages|~1300.5
Sengoku period|1467|Sengoku
Early modern period|~1500.2|Early modern;Modern era;Modern period;Modern age
Colonial era|~1500.5|Colonial period;Colonialism
Mughal era|1526
Age of Sail|~1571
Dutch Golden Age|~1588
Caroline era|1625
Interregnum|1649|Commonwealth
Restoration|1660
Rococo|~1730
Neoclassical period|~1760.5|Neoclassicism;Neoclassical
Antebellum era|~1815|Antebellum
Pax Britannica|1815.7
Second Industrial Revolution|~1870.5
Fin de siecle|~1890
Modernism|~1890.5|Modernist
Weimar era|1918.5|Weimar Republic;Weimar
Soviet era|1922|Soviet period
Art Deco|~1925
Anthropocene|~1950
Postmodernism|~1950.5|Postmodern
Jet Age|~1952
Civil rights era|1954|Civil rights movement
Contemporary era|1945.7|Contemporary`);

  M('revolutions', `
Athenian Revolution|-508
Commercial Revolution|~1000
Peasants' Revolt|1381
Printing Revolution|~1440
Dutch Revolt|1566
Bohemian Revolt|1618
Portuguese Restoration|1640
Batavian Revolution|1795
Irish Rebellion|1798|Irish Rebellion of 1798
Serbian Revolution|1804
Mexican War of Independence|1810
Decembrist revolt|1825|Decembrist
November Uprising|1830.9
Taiping Rebellion|1850
Indian Rebellion|1857|Indian Mutiny
Second Industrial Revolution|~1870
Philippine Revolution|1896
Russian Revolution of 1905|1905|1905 Revolution;First Russian Revolution
Persian Constitutional Revolution|1905.9|Constitutional Revolution
Portuguese Republican Revolution|1910.8|5 October revolution
Easter Rising|1916
Spanish Revolution|1936
Guatemalan Revolution|1944
August Revolution|1945|Vietnamese Revolution
Indonesian National Revolution|1945.6|Indonesian Revolution
Bolivian Revolution|1952.3
Algerian Revolution|1954
Quiet Revolution|1960.5
Sexual revolution|~1960.7
Zanzibar Revolution|1964
Libyan Revolution|1969
Saur Revolution|1978.3
Nicaraguan Revolution|1978.7|Sandinista Revolution
Singing Revolution|1987
Revolutions of 1989|1989.3|Fall of Communism;1989 Revolutions
Bulldozer Revolution|2000
Cedar Revolution|2005
Tulip Revolution|2005.2
Saffron Revolution|2007
Umbrella Revolution|2014.7|Umbrella Movement`);

  M('ships', `
Sao Gabriel|1497
Matthew|1497.3
Great Harry|1514|Henri Grace a Dieu;Henry Grace a Dieu
Trinidad|1519.1
Revenge|1577.5
Susan Constant|1605
Half Moon|1608|Halve Maen
Batavia|1628
Arbella|1630
Sovereign of the Seas|1637
Adventure Galley|1695
Whydah|1715|Whydah Gally
Bonhomme Richard|1765.5
HMS Resolution|1771
Turtle|1775
HMS Bellerophon|1786
HMS Sirius|1786.5
HMS Temeraire|1798|Fighting Temeraire
Essex|1799
USS Chesapeake|1799.5
Clermont|1807|North River Steamboat
HMS Terror|1813
SS Savannah|1818
HMS Erebus|1826
Great Western|1837|SS Great Western
HMS Birkenhead|1845
Flying Cloud|1851
CSS Virginia|1855|Merrimack;Merrimac
HMS Challenger|1858.2
CSS Alabama|1862.5
H. L. Hunley|1863|Hunley
Nimrod|1867
Thermopylae|1868
Gjoa|1872|Gjøa
Terra Nova|1884
Turbinia|1894
Aurora|1900.4
Mikasa|1900.8
SS Californian|1901.5
RMS Mauretania|1906.7
Empress of Ireland|1906.1
SMS Emden|1908
HMS Warspite|1913
USS Lexington|1925
Akagi|1925.3
Empire Windrush|1930|Windrush;HMT Empire Windrush
USS Indianapolis|1931
SS Normandie|1932|Normandie
Scharnhorst|1936.7
USS Yorktown|1936.3
Wilhelm Gustloff|1937.4
RMS Queen Elizabeth|1938.7|Queen Elizabeth
HMS Prince of Wales|1939.3
Tirpitz|1939.2
Calypso|1942
Granma|1943
HMS Vanguard|1944.9
Andrea Doria|1951
SS United States|1951.5
Trieste|1953.6
Torrey Canyon|1959
SS Canberra|1960
HMS Conqueror|1969
HMS Sheffield|1971
USS Nimitz|1972
HMS Invincible|1977
Herald of Free Enterprise|1979
Kursk|1994
USS Cole|1995
Queen Mary 2|2003|QM2
Costa Concordia|2005
Ever Given|2018`);

  M('documents', `
Cyrus Cylinder|-539
Rosetta Stone|-196
Edict of Thessalonica|380
Code of Justinian|529|Justinian Code;Corpus Juris Civilis
Constitution of Medina|622
Treaty of Wedmore|878
Concordat of Worms|1122
Constitutions of Clarendon|1164
Provisions of Oxford|1258
Statute of Rhuddlan|1284
Golden Bull|1356
Treaty of Bretigny|1360
Treaty of Windsor|1386
Kalmar Union|1397|Union of Kalmar
Treaty of Troyes|1420
Peace of Lodi|1454
Treaty of Granada|1491
Edict of Worms|1521
Augsburg Confession|1530
Act of Supremacy|1534
Union of Lublin|1569
Union of Utrecht|1579
National Covenant|1638
Grand Remonstrance|1641
Solemn League and Covenant|1643
Navigation Acts|1651|Navigation Act
Instrument of Government|1653
Treaty of the Pyrenees|1659
Declaration of Breda|1660
Treaty of Breda|1667
Test Act|1673
Toleration Act|1689.3|Act of Toleration
Treaty of Nerchinsk|1689.6
Treaty of Limerick|1691
Treaty of Ryswick|1697
Act of Settlement|1701
Treaty of Nystad|1721
Treaty of Aix-la-Chapelle|1748
Stamp Act|1765
Olive Branch Petition|1775
Virginia Declaration of Rights|1776.4
Treaty of Alliance|1778
Northwest Ordinance|1787.5
Federalist Papers|1787.8
Tennis Court Oath|1789.4
Jay Treaty|1794|Jay's Treaty
Treaty of Greenville|1795
Treaty of Campo Formio|1797
Concordat of 1801|1801
Treaty of Amiens|1802|Peace of Amiens
Treaty of Tilsit|1807
Treaty of Fontainebleau|1814.3
Adams-Onis Treaty|1819
Missouri Compromise|1820
Catholic Emancipation Act|1829|Catholic Emancipation;Roman Catholic Relief Act
Great Reform Act|1832|Reform Act;Reform Act 1832
Slavery Abolition Act|1833
People's Charter|1838
Treaty of London|1839
Oregon Treaty|1846
Declaration of Sentiments|1848.6|Seneca Falls Declaration
Treaty of Fort Laramie|1851
Treaty of Kanagawa|1854|Convention of Kanagawa
Homestead Act|1862
Thirteenth Amendment|1865|13th Amendment
Alaska Purchase|1867.3
Austro-Hungarian Compromise|1867.4|Ausgleich
Treaty of Frankfurt|1871
Treaty of San Stefano|1878.2
Triple Alliance|1882
Reinsurance Treaty|1887
Treaty of Shimonoseki|1895
Anglo-Japanese Alliance|1902
Treaty of Vereeniging|1902.4
Treaty of Portsmouth|1905
Triple Entente|1907
Sykes-Picot Agreement|1916|Sykes-Picot
Zimmermann Telegram|1917.1|Zimmermann Note
Fourteen Points|1918.05
Treaty of Saint-Germain|1919.7
Nineteenth Amendment|1920|19th Amendment
Treaty of Trianon|1920.4
Treaty of Sevres|1920.6
Washington Naval Treaty|1922
Treaty of Rapallo|1922.3
Dawes Plan|1924
Locarno Treaties|1925|Locarno;Locarno Pact
Lateran Treaty|1929
Statute of Westminster|1931
Anti-Comintern Pact|1936
Pact of Steel|1939.4
Tripartite Pact|1940
Lend-Lease Act|1941.2|Lend-Lease
Bretton Woods Agreement|1944|Bretton Woods
Yalta Agreement|1945.1|Yalta
Potsdam Agreement|1945.6|Potsdam
Marshall Plan|1948.3
Treaty of San Francisco|1951
ANZUS Treaty|1951.7|ANZUS
Geneva Accords|1954
Austrian State Treaty|1955.4
Partial Test Ban Treaty|1963|Test Ban Treaty
Elysee Treaty|1963.05
Civil Rights Act|1964
Outer Space Treaty|1967
SALT I|1972|SALT;Strategic Arms Limitation Treaty
Paris Peace Accords|1973
Sunningdale Agreement|1973.9|Sunningdale
Helsinki Accords|1975
Panama Canal Treaty|1977|Torrijos-Carter Treaties
Schengen Agreement|1985|Schengen
Anglo-Irish Agreement|1985.9
Single European Act|1986
INF Treaty|1987.9
Montreal Protocol|1987.7
START I|1991|START
NAFTA|1992.9|North American Free Trade Agreement
Downing Street Declaration|1993.9
Dayton Agreement|1995|Dayton Accords;Dayton
Treaty of Amsterdam|1997.8
Rome Statute|1998.5
Treaty of Nice|2001
St Andrews Agreement|2006
Edinburgh Agreement|2012
Brexit withdrawal agreement|2020|Withdrawal Agreement
Abraham Accords|2020.7`);

  M('space', `
Sputnik 2|1957.85|Laika
Vanguard|1958.2|Vanguard 1
Corona|1959.5
TIROS|1960|TIROS-1
Echo|1960.6|Echo 1
Freedom 7|1961.35
Ranger|1961.6
Friendship 7|1962.1
Telstar|1962.5
Syncom|1963
Zond|1964.3
Early Bird|1965|Intelsat;Intelsat I
Proton|1965.5
Surveyor|1966.4
Lunar Orbiter|1966.6
Saturn V|1967.85
N1|1969.1
Long March|1970.3
Lunokhod|1970.85
Landsat|1972.5
Almaz|1973.2
Helios|1974.9
Pioneer Venus|1978.4
Ariane|1979.98
IRAS|1983.05
Spacelab|1983.9
Vega|1984.95
Giotto|1985.5
Energia|1987.4
Buran|1988.87
Phobos|1988.5
Hipparcos|1989.6
COBE|1989.9
Ulysses|1990.8
Compton|1991.3|Compton Gamma Ray Observatory
Clementine|1994
Shuttle-Mir|1995
SOHO|1995.9
NEAR Shoemaker|1996.1
Mars Global Surveyor|1996.85
Lunar Prospector|1998.02
Deep Space 1|1998.8
Stardust|1999.1
Chandra|1999.55|Chandra X-ray Observatory
Mars Odyssey|2001.3
WMAP|2001.5
Hayabusa|2003.35
Mars Express|2003.42|Beagle 2
Spitzer|2003.65|Spitzer Space Telescope
SpaceShipOne|2003.95
MESSENGER|2004.6
Deep Impact|2005.03
Mars Reconnaissance Orbiter|2005.6
Venus Express|2005.85
Phoenix|2007.6
Dawn|2007.74
Kaguya|2007.7|SELENE
Fermi|2008.45
Lunar Reconnaissance Orbiter|2009.46|LRO
Herschel|2009.37
Planck|2009.38
Falcon 9|2010.42
Akatsuki|2010.38
GRAIL|2011.69
Mangalyaan|2013.85|Mars Orbiter Mission
MAVEN|2013.88
Gaia|2013.97
Orion|2014.92
Hayabusa2|2014.91
ExoMars|2016.2
OSIRIS-REx|2016.69|Osiris Rex
Falcon Heavy|2018.1
TESS|2018.3
InSight|2018.35
Parker Solar Probe|2018.61
BepiColombo|2018.8
Starliner|2019.97
Solar Orbiter|2020.1
Hope|2020.55|Emirates Mars Mission;Hope probe
Tianwen-1|2020.56|Tianwen;Zhurong
Inspiration4|2021.7
Lucy|2021.79
DART|2021.9
Space Launch System|2022.87|SLS
JUICE|2023.28
Starship|2023.3
Euclid|2023.5
Psyche|2023.78
Europa Clipper|2024.78
Polaris Dawn|2024.7`);

  M('queens', `
Merneith|~-2950
Twosret|~-1191|Tausret
Semiramis|~-811|Shammuramat
Tomyris|~-530
Artemisia I|~-484|Artemisia;Artemisia of Caria
Arsinoe II|~-277
Amanirenas|~-40
Trung Sisters|40|Trung Trac
Cartimandua|43
Suiko|593|Empress Suiko
Jindeok|647|Jindeok of Silla
Jito|686|Empress Jito
Genmei|707|Empress Genmei
Koken|749|Empress Koken;Shotoku
Jinseong|887|Jinseong of Silla
Didda|980|Didda of Kashmir
Zoe|1042|Zoe Porphyrogenita;Empress Zoe
Theodora|1042.1|Theodora Porphyrogenita;Empress Theodora
Arwa al-Sulayhi|1067|Arwa
Urraca of Leon|1109|Urraca
Melisende of Jerusalem|1131|Melisende
Eleanor of Aquitaine|1137|Eleanor
Petronilla of Aragon|1137.5|Petronilla
Constance of Sicily|1194|Constance
Rusudan of Georgia|1223|Rusudan
Shajar al-Durr|1250
Rudrama Devi|1262
Joan I of Navarre|1274
Margaret, Maid of Norway|1286|Maid of Norway
Joanna I of Naples|1343|Joanna of Naples
Mary of Hungary|1382|Maria of Hungary
Blanche I of Navarre|1425|Blanche of Navarre
Catherine Cornaro|1474.5|Caterina Cornaro
Jeanne d'Albret|1555|Joan III of Navarre
Amina of Zazzau|~1576|Amina
Anna Jagiellon|1575
Meisho|1629|Empress Meisho
Ulrika Eleonora|1718
Ahilyabai Holkar|1767|Ahilyabai
Maria II of Portugal|1826|Maria II
Pomare IV|1827
Ranavalona III|1883
Zewditu|1916|Empress Zewditu`);

  // The true oldest answers, where the rolls above stopped short of them.
  M('wars', `
Sumer-Elam war|~-2700|Sumerian-Elamite war;Kish-Elam war;Sumer and Elam
Lagash-Umma war|~-2450|Umma-Lagash war;Lagash and Umma`);
  M('explorers', `
Harkhuf|~-2290`);
  M('inventions', `
Stone tools|~-3300000|Stone tool;Hand axe;Handaxe
Fire|~-1000000|Control of fire;Fire making
Spear|~-400000
Clothing|~-170000|Clothes
Bow and arrow|~-70000|Bow;Arrow
Sewing needle|~-50000|Needle
Flute|~-40000
Rope|~-28000
Fish hook|~-23000|Fishhook
Agriculture|~-10000|Farming
Canoe|~-8000|Dugout canoe`);
  M('landmarks', `
Tower of Jericho|~-8000|Jericho`);
  M('scientists', `
Imhotep|~-2650`);
  M('writers', `
Enheduanna|~-2285`);
  M('painters', `
Sophilos|~-620
Kleitias|~-600|Clitias
Exekias|~-575
Polygnotus|~-500
Zeuxis|~-464
Apelles|~-370
Gu Kaizhi|~344
Wu Daozi|~680`);
  M('composers', `
Limenius|~-128
Mesomedes|~130|Mesomedes of Crete
Kassia|~810|Kassiani
Notker the Stammerer|~840|Notker
Leonin|~1150|Léonin`);
  M('generals', `
Narmer|~-3100|Menes
Eannatum|~-2450`);
  M('ships', `
Khufu ship|~-2500|Khufu's ship;Solar barque;Khufu barque
Sutton Hoo ship|~625|Sutton Hoo
Oseberg ship|~820|Oseberg
Gokstad ship|~890|Gokstad
Mora|1066
White Ship|1120
Grace Dieu|1418`);
  M('queens', `
Neithhotep|~-3050|Neith-hotep
Kubaba|~-2500|Kug-Bau`);
  M('documents', `
Treaty of Mesilim|~-2550|Mesilim
Reforms of Urukagina|~-2350|Urukagina;Code of Urukagina
Treaty of Ebla|~-2350|Ebla-Abarsal treaty;Ebla and Abarsal
Code of Ur-Nammu|~-2100|Ur-Nammu`);
  M('japanese-periods', `
Japanese Paleolithic|~-35000|Paleolithic`);
  M('napoleonic-battles', `
Quievrain|1792.32
Marquain|1792.33
Verdun|1792.67|Siege of Verdun`);

  // ---------- building the bank ----------
  /** Small stable string hash (FNV-1a), used for seeds and ids. */
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function parseRoll(def) {
    var out = [];
    def.roll.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var f = line.split('|'), name = f[0], y = f[1] || '';
      var approx = y.charAt(0) === '~';
      if (approx) y = y.slice(1);
      out.push({ name: name, year: parseFloat(y), approx: approx,
        alts: f[2] ? f[2].split(';').map(function (x) { return x.trim(); }).filter(Boolean) : [],
        key: def.id + ':' + name });
    });
    return out;
  }

  /** What an answer of a given date is worth: 3 up to the first cut-off, 2 up to the second, 1 after. */
  function damage(year, cut) { return year <= cut[0] ? 3 : year <= cut[1] ? 2 : 1; }

  /** Is an answer within a question's bounds? Every answer on a roll is; a variant asks for only some of them. */
  function within(q, a) {
    return (q.from == null || a.year >= q.from) && (q.to == null || a.year <= q.to) && (!q.pattern || q.pattern.test(a.name));
  }

  function makePrompt(def, family, source, people, by, topic) {
    var inside = [], outside = [];
    source.forEach(function (a) {
      if (!within(def, a)) { outside.push(a); return; }
      inside.push({ name: a.name, year: a.year, approx: a.approx, alts: a.alts, key: a.key, dmg: damage(a.year, def.cut) });
    });
    var total = 0, oldest = inside[0], newest = inside[0];
    inside.forEach(function (a) {
      total += a.dmg;
      if (a.year < oldest.year) oldest = a;
      if (a.year > newest.year) newest = a;
    });
    return { id: def.id, family: family, tier: def.tier, topic: topic, q: def.q, by: by, cut: def.cut.slice(), people: people,
      from: def.from, to: def.to, pattern: def.pattern,
      answers: inside, outside: outside, oldest: oldest, span: newest.year - oldest.year,
      total: total, hpCap: Math.max(3, Math.floor(total / 2)) };
  }

  /** Expand the rolls into the list of questions the game draws from. */
  function buildBank() {
    var bank = [], rolls = {};
    LISTS.forEach(function (def) {
      var roll = rolls[def.id] = { def: def, answers: parseRoll(def) };
      bank.push(makePrompt(def, def.id, roll.answers, def.people, def.by, def.topic));
    });
    VARIANTS.forEach(function (def) {
      var roll = rolls[def.base];
      if (!roll) throw new Error('variant ' + def.id + ' has no roll ' + def.base);
      bank.push(makePrompt(def, def.base, roll.answers, roll.def.people, roll.def.by, roll.def.topic));
    });
    return bank;
  }

  /** "27 BC", "AD 79", "1066", "c. 2,560 BC". */
  function fmtYear(a) {
    var y = a.year < 0 ? Math.ceil(a.year) : Math.floor(a.year), s; // decimals only order events within a year
    function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    if (y < 0) s = (y <= -10000 ? commas(-y) : String(-y)) + ' BC';
    else s = y < 1000 ? 'AD ' + y : String(y);
    return (a.approx ? 'c. ' : '') + s;
  }

  WW.hashStr = hashStr;
  WW.buildBank = buildBank;
  WW.fmtYear = fmtYear;
  WW.damage = damage;
  WW.within = within;
})(typeof globalThis !== 'undefined' ? globalThis : this);
