/* Wallward question bank: history only.
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
 *     negative years are BC, "~" marks an approximate year, a decimal orders
 *     events inside one year, and "*" marks a well-known name that may be
 *     used for the letter hints.
 *
 *   V(id, base, tier, question, [cut3, cut2], from, to, pattern?)
 *     a narrower question drawn from a roll above (a "variant"). Names outside
 *     from..to are recognised but refused.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var LISTS = [], VARIANTS = [];
  function L(id, tier, q, by, cut, roll, flag) { LISTS.push({ id: id, tier: tier, q: q, by: by, cut: cut, roll: roll, people: flag === 'P' }); }
  function V(id, base, tier, q, cut, from, to, pattern) { VARIANTS.push({ id: id, base: base, tier: tier, q: q, cut: cut, from: from, to: to, pattern: pattern || null }); }

  // ======================= tier 1 =======================

  L('roman-emperors', 1, 'Name a Roman emperor.', 'start of reign', [68, 192], `
*Augustus|-27|Octavian;Caesar Augustus;Octavius
Tiberius|14
*Caligula|37|Gaius
Claudius|41
*Nero|54
Galba|68
Otho|69
Vitellius|69
Vespasian|69
Titus|79
Domitian|81
Nerva|96
*Trajan|98
*Hadrian|117
Antoninus Pius|138|Antoninus
*Marcus Aurelius|161|Aurelius
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
*Diocletian|284
Maximian|286
Constantius Chlorus|305|Constantius I
Galerius|305
Maxentius|306
*Constantine the Great|306|Constantine;Constantine I
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
Theodosius I|379|Theodosius the Great
Arcadius|395
Honorius|395
Valentinian III|425
Majorian|457
Romulus Augustulus|475|Romulus Augustus`);

  L('eng-monarchs', 1, 'Name a king or queen of England or Britain.', 'start of reign', [1153, 1484], `
*Alfred the Great|871|Alfred
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
*William the Conqueror|1066.9|William I
William II|1087|William Rufus
Henry I|1100
Stephen|1135
Henry II|1154
*Richard the Lionheart|1189|Richard I
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
*Henry VIII|1509
Edward VI|1547
Lady Jane Grey|1553|Jane
Mary I|1553.5|Mary Tudor;Bloody Mary
*Elizabeth I|1558
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
*Victoria|1837
Edward VII|1901
George V|1910
Edward VIII|1936
George VI|1936.9
*Elizabeth II|1952
Charles III|2022`);

  L('us-presidents', 1, 'Name a president of the United States.', 'start of term', [1825, 1897], `
*George Washington|1789
John Adams|1797
*Thomas Jefferson|1801
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
*Abraham Lincoln|1861|Abe Lincoln;Honest Abe
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
*John F. Kennedy|1961|JFK;Jack Kennedy
Lyndon B. Johnson|1963|LBJ
Richard Nixon|1969
Gerald Ford|1974
Jimmy Carter|1977|James Carter
Ronald Reagan|1981
George H. W. Bush|1989|Bush Sr;Bush Senior;George Bush Sr;George Bush Senior;Bush 41;HW Bush;George Herbert Walker Bush
Bill Clinton|1993|William Clinton
George W. Bush|2001|Bush Jr;Bush Junior;George Bush Jr;George Bush Junior;Bush 43;W Bush;Dubya;George Walker Bush
*Barack Obama|2009
Donald Trump|2017
Joe Biden|2021|Joseph Biden`, 'P');

  L('wars', 1, 'Name a war.', 'when it began', [1499, 1899], `
Trojan War|~-1200|Troy
Greco-Persian Wars|-499|Persian Wars;Persian War;Greco-Persian War
*Peloponnesian War|-431
Punic Wars|-264|Punic War;First Punic War
Second Punic War|-218|Hannibalic War
Third Punic War|-149
Gallic Wars|-58|Gallic War
Crusades|1096|First Crusade;The Crusades
Mongol conquests|1206|Mongol invasions;Mongol invasion
Wars of Scottish Independence|1296|Scottish Wars of Independence;Scottish War of Independence;Scottish Independence
*Hundred Years' War|1337|100 Years War
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
*Seven Years' War|1756|French and Indian War
*American Revolutionary War|1775|American War of Independence;American Revolution;Revolutionary War;War of Independence
French Revolutionary Wars|1792
*Napoleonic Wars|1803|Napoleonic War
War of 1812|1812
Greek War of Independence|1821
Opium Wars|1839|Opium War;First Opium War
Mexican-American War|1846|Mexican War
Taiping Rebellion|1850|Taiping Civil War;Taiping
Crimean War|1853|Crimea
*American Civil War|1861|US Civil War;Civil War
Austro-Prussian War|1866|Seven Weeks War
Franco-Prussian War|1870
Anglo-Zulu War|1879|Zulu War
First Sino-Japanese War|1894|Sino-Japanese War
Spanish-American War|1898
Boer War|1899|Second Boer War;Anglo-Boer War;South African War;Boer Wars
Boxer Rebellion|1899.9|Boxer Uprising;Boxer
Russo-Japanese War|1904
Balkan Wars|1912|Balkan War
*World War I|1914|First World War;WWI;WW1;Great War;World War One
Russian Civil War|1917|Civil War
Irish War of Independence|1919
Chinese Civil War|1927|Civil War
Spanish Civil War|1936|Civil War
Second Sino-Japanese War|1937
*World War II|1939|Second World War;WWII;WW2;World War Two
Winter War|1939.9
Cold War|1947
Arab-Israeli War|1948|1948 Arab-Israeli War;First Arab-Israeli War;Israeli War of Independence
Korean War|1950|Korea
Algerian War|1954|Algerian War of Independence
*Vietnam War|1955
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
*Marathon|-490
*Thermopylae|-480
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
*Hastings|1066.8
Manzikert|1071
Hattin|1187
Bouvines|1214
Stirling Bridge|1297
Bannockburn|1314
Crécy|1346
Poitiers|1356
*Agincourt|1415
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
*Trafalgar|1805
Austerlitz|1805.9
Borodino|1812
Leipzig|1813
New Orleans|1815
*Waterloo|1815.5
The Alamo|1836
Balaclava|1854|Balaklava;Charge of the Light Brigade
Bull Run|1861|Manassas;First Bull Run
Antietam|1862|Sharpsburg
*Gettysburg|1863
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
*The Somme|1916.5
Passchendaele|1917
Dunkirk|1940|Dunkerque
Britain|1940.5|Battle of Britain
Pearl Harbor|1941
Midway|1942
El Alamein|1942.8|Alamein
*Stalingrad|1942.6
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
*Persian Empire|-550|Persia;Achaemenid;Achaemenid Empire
Athenian Empire|-478|Athens;Delian League
Macedonian Empire|-336|Macedon;Macedonia;Alexander's empire
Maurya Empire|-322|Mauryan
Seleucid Empire|-312|Seleucids
Parthian Empire|-247|Parthia
Han Empire|-202|Han dynasty;Han China
*Roman Empire|-27|Rome
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
*Holy Roman Empire|962|HRE
Seljuk Empire|1037|Seljuks;Seljuq
*Mongol Empire|1206|Mongols;Mongolian;Mongolian Empire
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
*British Empire|1583|Britain;English Empire
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
*Sumer|~-4500|Sumerians;Sumerian;Sumeria;Mesopotamia;Mesopotamian
Norte Chico|~-3500|Caral;Caral-Supe
Indus Valley|~-3300|Indus Valley Civilisation;Indus Valley Civilization;Indus;Harappan;Harappa;Ancient India
Elam|~-3200|Elamites;Elamite
*Ancient Egypt|~-3100|Egypt;Egyptians;Egyptian
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
*Ancient Greece|~-800|Greece;Greeks;Greek
Celts|~-800.1|Celtic;Gauls
*Ancient Rome|-753|Rome;Romans;Roman
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
*Leif Erikson|~1000|Leif Ericson;Leif Eriksson;Leif Ericsson
*Marco Polo|1271
Ibn Battuta|1325|Battuta
Zheng He|1405|Cheng Ho
Henry the Navigator|1415|Prince Henry
Bartolomeu Dias|1487|Bartholomew Diaz;Bartolomeu Diaz;Diaz
*Christopher Columbus|1492|Cristoforo Colombo
John Cabot|1497
*Vasco da Gama|1497.5|da Gama
Amerigo Vespucci|1499
Pedro Álvares Cabral|1500
Vasco Núñez de Balboa|1513|Vasco de Balboa;Nunez de Balboa
Juan Ponce de León|1513.2|Ponce de Leon
Hernán Cortés|1519|Hernando Cortez;Hernan Cortez;Cortez
*Ferdinand Magellan|1519.6
Francisco Pizarro|1524
Jacques Cartier|1534
Hernando de Soto|1539|de Soto
Francisco Vázquez de Coronado|1540
*Francis Drake|1577
Walter Raleigh|1584|Ralegh
Willem Barentsz|1594|Barents;William Barents
Samuel de Champlain|1603
Henry Hudson|1607
Abel Tasman|1642
René-Robert de La Salle|1679|La Salle;Robert de La Salle
Vitus Bering|1728
*James Cook|1768
Mungo Park|1795
Alexander von Humboldt|1799
Matthew Flinders|1801
Lewis and Clark|1804|Meriwether Lewis;William Clark;Lewis
Sacagawea|1804.1|Sacajawea
John Franklin|1819
Charles Darwin|1831
*David Livingstone|1841
Richard Burton|1853|Richard Francis Burton
John Hanning Speke|1856
Burke and Wills|1860|Robert Burke;William Wills;Burke
Henry Morton Stanley|1871
Robert Peary|1886
Fridtjof Nansen|1888
Robert Falcon Scott|1901|Scott of the Antarctic
*Roald Amundsen|1903
*Ernest Shackleton|1907
Jacques Cousteau|1943
Thor Heyerdahl|1947
Edmund Hillary|1953
Tenzing Norgay|1953.1|Tenzing;Sherpa Tenzing
Yuri Gagarin|1961
*Neil Armstrong|1969
Ranulph Fiennes|1979`, 'P');

  L('inventions', 1, 'Name a famous invention.', 'when it was invented', [999, 1799], `
*Wheel|~-3500
Writing|~-3200|Alphabet
Plough|~-3000|Plow
Abacus|~-2400
Coins|~-600|Coinage;Money;Coin
Compass|~-200|Magnetic compass
Concrete|~-150|Cement
*Paper|105
Windmill|~650
Paper money|~800|Banknote;Banknotes
Gunpowder|~850
Eyeglasses|~1286|Glasses;Spectacles
Mechanical clock|~1300|Clock
*Printing press|1440|Printing;Movable type
Microscope|1590
Thermometer|1593
*Telescope|1608
Barometer|1643
Pendulum clock|1656
Piano|1700|Pianoforte
*Steam engine|1712
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
*Telephone|1876|Phone
Phonograph|1877|Gramophone;Record player
*Light bulb|1879|Lightbulb;Electric light;Electric light bulb
Machine gun|1884|Maxim gun
*Automobile|1886|Car;Motor car;Motorcar
Dishwasher|1886.5
Zip|1893|Zipper
Diesel engine|1893.5
Cinema|1895|Film;Movies;Motion picture;Motion pictures;Cinematograph;Movie camera
Radio|1895.3|Wireless
X-ray|1895.8|X-rays;Xray
Vacuum cleaner|1901|Hoover
Air conditioning|1902|Air conditioner
*Aeroplane|1903|Airplane;Plane;Aircraft;Powered flight
Plastic|1907|Bakelite
Stainless steel|1913
Tank|1915
Television|1927|TV;Telly
Penicillin|1928|Antibiotics;Antibiotic
Radar|1935
Jet engine|1937|Jet
Helicopter|1939
Nuclear reactor|1942
*Computer|1945|Electronic computer;ENIAC
Atomic bomb|1945.5|Nuclear bomb;Atom bomb;Nuclear weapon;Nuclear weapons
Microwave oven|1945.8|Microwave
Transistor|1947
Credit card|1950
Satellite|1957|Sputnik
Microchip|1958|Integrated circuit;Silicon chip;Chip
Laser|1960
Contraceptive pill|1960.5|Birth control pill;The pill
*Internet|1969|ARPANET
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
*Stonehenge|~-3000
*Pyramids of Giza|~-2560|Great Pyramid;Great Pyramid of Giza;Pyramids;Pyramid of Giza;Pyramid;Giza;Pyramid of Khufu;Egyptian pyramids
Great Sphinx|~-2500|Sphinx;Sphinx of Giza
Abu Simbel|~-1264
Parthenon|-447|Acropolis
Petra|~-300
*Great Wall of China|~-220|Great Wall;Wall of China
Terracotta Army|~-210|Terracotta Warriors
Pont du Gard|~50
*Colosseum|80|Coliseum;Roman Colosseum
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
*Machu Picchu|~1450
Sistine Chapel|1473
Kremlin|1482|Moscow Kremlin
St. Peter's Basilica|1506|St Peters;Saint Peter's
St Basil's Cathedral|1555|Saint Basil's;St Basils
Rialto Bridge|1591
Golden Temple|1604|Harmandir Sahib
Blue Mosque|1609|Sultan Ahmed Mosque
*Taj Mahal|1632
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
*Statue of Liberty|1886
*Eiffel Tower|1889
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
*Aristotle|-384
Euclid|~-325
*Archimedes|~-287
Eratosthenes|~-276
Ptolemy|~100
Galen|129
Hypatia|~360
Al-Khwarizmi|~780|Khwarizmi
Alhazen|~965|Ibn al-Haytham
Avicenna|980|Ibn Sina
Roger Bacon|~1219
*Leonardo da Vinci|1452|Leonardo;da Vinci
*Nicolaus Copernicus|1473
Paracelsus|1493
Andreas Vesalius|1514
Tycho Brahe|1546
Francis Bacon|1561
*Galileo Galilei|1564|Galileo
Johannes Kepler|1571
William Harvey|1578
René Descartes|1596
Blaise Pascal|1623
Robert Boyle|1627
Christiaan Huygens|1629
Antonie van Leeuwenhoek|1632|van Leeuwenhoek
Robert Hooke|1635
*Isaac Newton|1643
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
*Michael Faraday|1791
Charles Babbage|1791.9
Charles Lyell|1797
*Charles Darwin|1809
Ada Lovelace|1815
James Prescott Joule|1818
Gregor Mendel|1822
*Louis Pasteur|1822.9
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
*Marie Curie|1867|Madame Curie;Marie Sklodowska Curie
Ernest Rutherford|1871
Guglielmo Marconi|1874
*Albert Einstein|1879
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
*Stephen Hawking|1942
Tim Berners-Lee|1955|Berners Lee`, 'P');

  L('writers', 1, 'Name a famous writer.', 'birth', [1499, 1799], `
*Homer|~-800
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
*Dante Alighieri|1265|Dante
Petrarch|1304
Giovanni Boccaccio|1313
*Geoffrey Chaucer|~1343
Thomas Malory|~1415
Niccolò Machiavelli|1469
Thomas More|1478
François Rabelais|~1494
Miguel de Cervantes|1547
Christopher Marlowe|1564
*William Shakespeare|1564.3|Shakespear;The Bard
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
*Jane Austen|1775
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
*Charles Dickens|1812
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
*Mark Twain|1835|Samuel Clemens
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
*Ernest Hemingway|1899.6
Vladimir Nabokov|1899.3
Jorge Luis Borges|1899.7
John Steinbeck|1902
*George Orwell|1903|Eric Blair
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
*Leonardo da Vinci|1452|Leonardo;da Vinci
Albrecht Dürer|1471
*Michelangelo|1475|Michelangelo Buonarroti
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
*Rembrandt|1606|Rembrandt van Rijn
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
*Claude Monet|1840
Pierre-Auguste Renoir|1841|Auguste Renoir
Henri Rousseau|1844
Paul Gauguin|1848
*Vincent van Gogh|1853|van Gogh
Georges Seurat|1859
Gustav Klimt|1862
Edvard Munch|1863
Henri de Toulouse-Lautrec|1864|Toulouse-Lautrec;Lautrec
Wassily Kandinsky|1866
Henri Matisse|1869
Piet Mondrian|1872
Paul Klee|1879
*Pablo Picasso|1881
Edward Hopper|1882
Amedeo Modigliani|1884
Diego Rivera|1886
Marc Chagall|1887
Georgia O'Keeffe|1887.9|O'Keefe;Georgia O'Keefe
L. S. Lowry|1887.8
Joan Miró|1893
René Magritte|1898
Mark Rothko|1903
*Salvador Dalí|1904
Frida Kahlo|1907
Francis Bacon|1909
Jackson Pollock|1912
Lucian Freud|1922
Roy Lichtenstein|1923
*Andy Warhol|1928
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
*Antonio Vivaldi|1678
Georg Philipp Telemann|1681
*Johann Sebastian Bach|1685.3|JS Bach
George Frideric Handel|1685.2|Händel;Georg Friedrich Händel;Haendel
Domenico Scarlatti|1685.8
Christoph Willibald Gluck|1714
Joseph Haydn|1732|Franz Joseph Haydn
*Wolfgang Amadeus Mozart|1756
*Ludwig van Beethoven|1770
Niccolò Paganini|1782
Carl Maria von Weber|1786
Gioachino Rossini|1792
Franz Schubert|1797
Gaetano Donizetti|1797.9
Hector Berlioz|1803
Felix Mendelssohn|1809
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
*Pyotr Ilyich Tchaikovsky|1840|Peter Tchaikovsky;Tchaikovski;Chaikovsky
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
*Alexander the Great|-336|Alexander
Chandragupta Maurya|-322|Chandragupta
Pyrrhus|-280|Pyrrhus of Epirus
Qin Shi Huang|-230|Shi Huangdi
*Hannibal|-221|Hannibal Barca
Scipio Africanus|-210|Scipio
Gaius Marius|-107|Marius
Sulla|-88
Spartacus|-73
Pompey|-67|Pompey the Great
*Julius Caesar|-58|Caesar;Gaius Julius Caesar
Vercingetorix|-52
Mark Antony|-44|Marc Antony;Marcus Antonius
Arminius|9|Hermann
Boudica|60|Boadicea;Boudicca
Trajan|101
*Attila the Hun|434|Attila
Belisarius|527
Khalid ibn al-Walid|632|Khalid
Charles Martel|732
*Charlemagne|768|Charles the Great
El Cid|1065|Rodrigo Diaz de Vivar
*William the Conqueror|1066|William I
Saladin|1174|Salah ad-Din
Richard the Lionheart|1189|Richard I
*Genghis Khan|1206|Chinggis Khan;Temujin;Genghis
Kublai Khan|1260|Kublai
William Wallace|1297
Robert the Bruce|1306
Edward the Black Prince|1346|Black Prince
Tamerlane|1370|Timur
Henry V|1415
*Joan of Arc|1429|Jeanne d'Arc
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
*George Washington|1775
*Napoleon Bonaparte|1796|Napoleon;Napoleon I
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
*Dwight D. Eisenhower|1942.5|Ike
George S. Patton|1942.8
Võ Nguyên Giáp|1954|Giap;General Giap
Che Guevara|1956
Norman Schwarzkopf|1991`, 'P');

  L('eras', 1, 'Name an age or era of history.', 'when it began', [-1000, 1499], `
Ice Age|~-2600000|Pleistocene;Last Ice Age
*Stone Age|~-2500000|Paleolithic;Palaeolithic;Old Stone Age
Mesolithic|~-10000|Middle Stone Age
Neolithic|~-9500|New Stone Age
Copper Age|~-4500|Chalcolithic
*Bronze Age|~-3300
Iron Age|~-1200
Classical antiquity|~-800|Antiquity;Classical Age;Classical;Ancient history
Hellenistic period|-323|Hellenistic Age
Pax Romana|-27|Roman peace
Late antiquity|~284
*Middle Ages|476|Medieval;Medieval period;Mediaeval;Medieval era
Dark Ages|476.1|Early Middle Ages
Islamic Golden Age|~750|Golden Age of Islam
Viking Age|793|Vikings
High Middle Ages|~1000
*Renaissance|~1300|Italian Renaissance
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
*Industrial Revolution|~1760|Industrial Age
Age of Revolution|1775|Age of Revolutions
Romantic era|~1798|Romanticism
Napoleonic era|1799
Regency era|1811
*Victorian era|1837
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
*Glorious Revolution|1688|Revolution of 1688
*Industrial Revolution|~1760
*American Revolution|1765|American War of Independence
*French Revolution|1789
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
*Russian Revolution|1917|October Revolution;February Revolution;Bolshevik Revolution
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
*Dunkirk|1940.4|Dunkerque;Dynamo
*Britain|1940.52|Battle of Britain;The Blitz;Blitz
Taranto|1940.86
Tobruk|1941.28|Siege of Tobruk
Crete|1941.38
Barbarossa|1941.47|Operation Barbarossa
Leningrad|1941.68|Siege of Leningrad
Moscow|1941.75
*Pearl Harbor|1941.93
Hong Kong|1941.94
Bataan|1942.02
Singapore|1942.1|Fall of Singapore
Coral Sea|1942.34
*Midway|1942.43
Guadalcanal|1942.6
Dieppe|1942.63|Dieppe Raid
*Stalingrad|1942.64
El Alamein|1942.8|Alamein
Kasserine Pass|1943.13|Kasserine
Kursk|1943.5
Sicily|1943.52|Invasion of Sicily;Operation Husky;Husky
Monte Cassino|1944.05|Cassino
Anzio|1944.06
Imphal|1944.18|Kohima;Imphal and Kohima
*Normandy|1944.43|D-Day;DDay;Normandy landings;Overlord;Operation Overlord
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
*Confucius|-551|Kong Fuzi;Kongzi
Heraclitus|~-535
Parmenides|~-515
Zeno of Elea|~-490|Zeno
*Socrates|~-470
Democritus|~-460
*Plato|~-428
Diogenes|~-412|Diogenes of Sinope
*Aristotle|-384
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
*René Descartes|1596
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
*Immanuel Kant|1724
Edmund Burke|1729
Jeremy Bentham|1748
Mary Wollstonecraft|1759
Georg Wilhelm Friedrich Hegel|1770|Georg Hegel
Arthur Schopenhauer|1788
John Stuart Mill|1806|JS Mill
Søren Kierkegaard|1813
*Karl Marx|1818
Friedrich Engels|1820
William James|1842
*Friedrich Nietzsche|1844|Nietzche;Nietsche
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
*Santa María|1492
Niña|1492.1
Pinta|1492.2
Mary Rose|1511
Victoria|1519
Golden Hind|1577|Golden Hinde;Pelican
*Mayflower|1620
Vasa|1627|Wasa
Queen Anne's Revenge|1710
HMS Endeavour|1764|Endeavor
*HMS Victory|1765
HMS Bounty|1787
USS Constitution|1797|Old Ironsides
HMS Beagle|1820
Amistad|1839|La Amistad
SS Great Britain|1843
SS Great Eastern|1858
HMS Warrior|1860
Mary Celeste|1861|Marie Celeste
USS Monitor|1862
*Cutty Sark|1869
USS Maine|1889
Fram|1892
Potemkin|1900|Battleship Potemkin
RRS Discovery|1901
RMS Carpathia|1902
HMS Dreadnought|1906
RMS Lusitania|1906.5
RMS Olympic|1910
*RMS Titanic|1911
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
*Bismarck|1939
Yamato|1940
USS Missouri|1944|Mighty Mo
Kon-Tiki|1947
HMY Britannia|1953|Royal Yacht Britannia
USS Nautilus|1954
Rainbow Warrior|1955
Queen Elizabeth 2|1967|QE2
Exxon Valdez|1986`);

  L('olympics', 1, 'Name a city that has hosted the Summer Olympics.', 'its first Games', [1912, 1960], `
*Athens|1896
*Paris|1900
St. Louis|1904
*London|1908
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
*Beijing|2008|Peking
Rio de Janeiro|2016|Rio`);

  // ======================= tier 2 =======================

  L('uk-pms', 2, 'Name a British prime minister.', 'start of first term', [1799, 1899], `
*Robert Walpole|1721
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
*William Pitt the Younger|1783.9|Pitt the Younger;Pitt
Henry Addington|1801
William Grenville|1806|Lord Grenville
Spencer Perceval|1809
Earl of Liverpool|1812|Lord Liverpool;Robert Jenkinson
George Canning|1827
Viscount Goderich|1827.6|Lord Goderich;Frederick Robinson
Duke of Wellington|1828|Arthur Wellesley
Earl Grey|1830|Lord Grey;Charles Grey
Viscount Melbourne|1834|Lord Melbourne;William Lamb
*Robert Peel|1834.9
Lord John Russell|1846|Earl Russell
Earl of Derby|1852|Lord Derby;Edward Smith-Stanley
Earl of Aberdeen|1852.9|Lord Aberdeen
Viscount Palmerston|1855|Lord Palmerston;Henry John Temple
*Benjamin Disraeli|1868
*William Gladstone|1868.9|William Ewart Gladstone
Marquess of Salisbury|1885|Lord Salisbury;Robert Gascoyne-Cecil
Earl of Rosebery|1894|Lord Rosebery
Arthur Balfour|1902
Henry Campbell-Bannerman|1905|Campbell-Bannerman
H. H. Asquith|1908|Herbert Asquith
*David Lloyd George|1916|Lloyd George
Bonar Law|1922|Andrew Bonar Law
Stanley Baldwin|1923
Ramsay MacDonald|1924
Neville Chamberlain|1937
*Winston Churchill|1940
Clement Attlee|1945
Anthony Eden|1955
Harold Macmillan|1957
Alec Douglas-Home|1963|Douglas-Home
Harold Wilson|1964
Edward Heath|1970|Ted Heath
James Callaghan|1976|Jim Callaghan
*Margaret Thatcher|1979|Maggie Thatcher
John Major|1990
*Tony Blair|1997
Gordon Brown|2007
David Cameron|2010
Theresa May|2016
Boris Johnson|2019|Boris
Liz Truss|2022|Elizabeth Truss
Rishi Sunak|2022.8
Keir Starmer|2024
Andy Burnham|2026`, 'P');

  L('french-monarchs', 2, 'Name a king or emperor of France.', 'start of reign', [986, 1588], `
Clovis I|481
Dagobert I|629
Pepin the Short|751|Pepin;Pippin the Short;Pepin III
*Charlemagne|768|Charles the Great;Charles I
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
*Louis XIV|1643|Sun King;Louis the Great
Louis XV|1715
*Louis XVI|1774
*Napoleon|1804|Napoleon I;Napoleon Bonaparte;Bonaparte
Louis XVIII|1814
Charles X|1824
Louis-Philippe|1830|Louis Philippe I
Napoleon III|1852|Louis-Napoleon`);

  L('russian-tsars', 2, 'Name a tsar or emperor of Russia.', 'start of reign', [1681, 1800], `
*Ivan the Terrible|1547|Ivan IV
Feodor I|1584|Fyodor I
Boris Godunov|1598|Godunov
False Dmitry I|1605|False Dmitri;Dmitry I
Vasili IV|1606|Vasily Shuisky;Vasily IV
Michael I|1613|Mikhail Romanov;Michael Romanov;Mikhail I
Alexis|1645|Alexei;Aleksei;Alexis I
Feodor III|1676|Fyodor III
Ivan V|1682
*Peter the Great|1682.4|Peter I
Catherine I|1725
Peter II|1727
Anna|1730|Anna Ivanovna;Anne
Ivan VI|1740
Elizabeth|1741|Elizaveta;Elizabeth Petrovna
Peter III|1762
*Catherine the Great|1762.5|Catherine II
Paul I|1796
Alexander I|1801
Nicholas I|1825
Alexander II|1855
Alexander III|1881
*Nicholas II|1894`);

  L('chinese-dynasties', 2, 'Name a Chinese dynasty.', 'founding', [-222, 959], `
Xia|~-2070|Hsia
Shang|~-1600|Yin
Zhou|~-1046|Chou;Western Zhou;Eastern Zhou
*Qin|-221|Chin;Ch'in
*Han|-202|Western Han;Eastern Han
Xin|9
Three Kingdoms|220|Wei;Shu;Wu;Cao Wei;Shu Han
Jin|266|Western Jin;Eastern Jin
Northern and Southern dynasties|420|Northern Wei;Liu Song;Southern dynasties;Northern dynasties
Sui|581
*Tang|618|T'ang
Five Dynasties and Ten Kingdoms|907|Five Dynasties;Later Liang
Liao|916|Khitan
Song|960|Sung;Northern Song;Southern Song
Western Xia|1038|Xi Xia;Tangut
Jurchen Jin|1115|Great Jin;Jurchen
Yuan|1271|Mongol
*Ming|1368
*Qing|1644|Ching;Ch'ing;Manchu`);

  L('pharaohs', 2, 'Name a pharaoh of ancient Egypt.', 'start of reign', [-2000, -1071], `
Narmer|~-3100|Menes
Djoser|~-2670|Zoser
Sneferu|~-2613|Snefru
*Khufu|~-2589|Cheops
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
*Hatshepsut|~-1479
Thutmose III|~-1479.1|Tuthmosis III
Amenhotep II|~-1427
Thutmose IV|~-1401|Tuthmosis IV
Amenhotep III|~-1391
*Akhenaten|~-1353|Amenhotep IV;Akhenaton
Smenkhkare|~-1335
*Tutankhamun|~-1332|Tutankhamen;King Tut;Tut;Tutankhamon
Ay|~-1323
Horemheb|~-1319
Ramesses I|~-1292|Ramses I;Rameses I
Seti I|~-1290|Sethos I
*Ramesses II|~-1279|Ramses II;Rameses II;Ramesses the Great;Ramses the Great;Ozymandias
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
*Cleopatra|-51|Cleopatra VII
Ptolemy XV|-44|Caesarion`);

  L('soviet-leaders', 2, 'Name a leader of the Soviet Union or Russia since 1917.', 'coming to power', [1917, 1953.9], `
*Vladimir Lenin|1917
*Joseph Stalin|1924|Josef Stalin
Georgy Malenkov|1953
Nikita Khrushchev|1953.7|Kruschev;Khruschev;Krushchev
Leonid Brezhnev|1964
Yuri Andropov|1982
Konstantin Chernenko|1984
*Mikhail Gorbachev|1985|Gorbachov
Boris Yeltsin|1991
*Vladimir Putin|2000
Dmitry Medvedev|2008|Dmitri Medvedev`, 'P');

  L('wives', 2, 'Name a wife of Henry VIII.', 'wedding', [1509, 1536], `
*Catherine of Aragon|1509|Katherine of Aragon;Aragon;Catherine;Katherine
*Anne Boleyn|1533|Ann Boleyn;Boleyn;Anne
Jane Seymour|1536|Seymour;Jane
Anne of Cleves|1540|Anna of Cleves;Cleves;Anne
Catherine Howard|1540.5|Katherine Howard;Kathryn Howard;Howard;Catherine;Katherine
Catherine Parr|1543|Katherine Parr;Parr;Catherine;Katherine`);

  L('wonders', 2, 'Name one of the Seven Wonders of the Ancient World.', 'when it was built', [-2000, -500], `
*Great Pyramid of Giza|~-2560|Pyramids;Great Pyramid;Pyramid of Giza;Pyramids of Giza;Pyramid;Giza;Pyramid of Khufu
*Hanging Gardens of Babylon|~-600|Hanging Gardens;Gardens of Babylon
Temple of Artemis|~-550|Temple of Artemis at Ephesus;Artemis;Temple of Diana;Artemision
Statue of Zeus at Olympia|~-435|Statue of Zeus;Zeus;Zeus at Olympia
Mausoleum at Halicarnassus|~-351|Mausoleum;Mausoleum of Halicarnassus;Halicarnassus;Tomb of Mausolus
Colossus of Rhodes|~-280|Colossus;Rhodes
Lighthouse of Alexandria|~-279|Pharos;Lighthouse;Pharos of Alexandria;Alexandria`);

  L('royal-houses', 2, 'Name a royal house that has ruled England or Britain.', 'when it took the throne', [1066, 1485], `
Wessex|871|Anglo-Saxon;Saxon
Denmark|1013|Knytlinga;Danish
*Normandy|1066|Norman;Normans
Blois|1135
*Plantagenet|1154|Angevin;Anjou;Plantagenets
Lancaster|1399|Lancastrian
York|1461|Yorkist
*Tudor|1485|Tudors
*Stuart|1603|Stewart;Stuarts
Orange-Nassau|1689|Orange;Nassau
Hanover|1714|Hanoverian;Hanoverians
Saxe-Coburg and Gotha|1901|Saxe-Coburg;Saxe-Coburg-Gotha
*Windsor|1917|Windsors`);

  L('space', 2, 'Name a space mission or programme.', 'launch', [1960, 1979], `
*Sputnik|1957|Sputnik 1
Explorer|1958|Explorer 1
Pioneer|1958.2|Pioneer 10;Pioneer 11
Project Mercury|1958.8|Mercury programme;Mercury program
Luna|1959|Luna 2;Luna 9;Lunik
*Apollo|1961|Apollo programme;Apollo program;Apollo 11;Apollo 13;Apollo 8
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
*Voyager|1977|Voyager 1;Voyager 2
*Space Shuttle|1981|Shuttle;Columbia;Challenger;Discovery;Atlantis;Endeavour;STS
Mir|1986
Magellan|1989
Galileo|1989.8
*Hubble|1990|Hubble Space Telescope
Mars Pathfinder|1996|Pathfinder;Sojourner
Cassini|1997|Cassini-Huygens
*International Space Station|1998|ISS;Space Station
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
*Hatshepsut|~-1479
*Cleopatra|-51|Cleopatra VII
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
*Isabella I of Castile|1474|Isabella of Castile;Isabella I;Isabel
Joanna of Castile|1504|Juana la Loca;Joanna the Mad;Juana;Joanna
*Mary, Queen of Scots|1542|Mary Stuart;Mary I of Scotland
Lady Jane Grey|1553
Mary I of England|1553.5|Mary I;Mary Tudor;Bloody Mary
*Elizabeth I|1558
Nzinga of Ndongo|1624|Nzinga;Njinga
Christina of Sweden|1632|Christina;Kristina
Mary II|1689
Anne|1702|Anne of Great Britain
Catherine I of Russia|1725|Catherine I
Anna of Russia|1730|Anna Ivanovna;Anna
*Maria Theresa|1740|Maria Theresia
Elizabeth of Russia|1741|Elizabeth Petrovna
*Catherine the Great|1762|Catherine II
Maria I of Portugal|1777|Maria I
Ranavalona I|1828
Isabella II of Spain|1833|Isabella II
*Victoria|1837
Wilhelmina|1890|Wilhelmina of the Netherlands
Liliuokalani|1891|Lili'uokalani
Salote Tupou III|1918|Salote
Juliana|1948|Juliana of the Netherlands
*Elizabeth II|1952
Margrethe II|1972|Margrethe II of Denmark
Beatrix|1980|Beatrix of the Netherlands`);

  L('documents', 2, 'Name a famous treaty, charter or declaration.', 'when it was made', [1499, 1799], `
Code of Hammurabi|~-1754|Hammurabi;Hammurabi's Code
Treaty of Kadesh|~-1259
Twelve Tables|~-450
Edict of Milan|313
Treaty of Verdun|843
Domesday Book|1086|Doomsday Book;Domesday
*Magna Carta|1215
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
*Declaration of Independence|1776|US Declaration of Independence;American Declaration of Independence
Articles of Confederation|1777
*US Constitution|1787|Constitution;United States Constitution;American Constitution;Constitution of the United States
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
*Emancipation Proclamation|1863
Geneva Convention|1864|Geneva Conventions;Geneva
British North America Act|1867
Treaty of Berlin|1878|Congress of Berlin
Entente Cordiale|1904
Balfour Declaration|1917|Balfour
Treaty of Brest-Litovsk|1918
*Treaty of Versailles|1919
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
*Mehmed II|1444|Mehmed the Conqueror
Bayezid II|1481
Selim I|1512|Selim the Grim
*Suleiman the Magnificent|1520|Suleiman I;Suleyman
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
*Abdul Hamid II|1876.6|Abdulhamid II
Mehmed V|1909
Mehmed VI|1918`);

  L('mughal-emperors', 3, 'Name a Mughal emperor.', 'start of reign', [1555, 1657], `
*Babur|1526
Humayun|1530
*Akbar|1556|Akbar the Great
Jahangir|1605
*Shah Jahan|1628
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
*Heian|794
Kamakura|1185
Muromachi|1336|Ashikaga
Sengoku|1467|Warring States
Azuchi-Momoyama|1568|Momoyama
*Edo|1603|Tokugawa
*Meiji|1868
Taisho|1912
Showa|1926
Heisei|1989
Reiwa|2019`);

  L('ww1-battles', 3, 'Name a battle of the First World War.', 'when it was fought', [1914.99, 1916.99], `
Mons|1914.64
Tannenberg|1914.65
Heligoland Bight|1914.66
*The Marne|1914.68
Ypres|1914.8
Coronel|1914.84
Falkland Islands|1914.94|Falklands
Dogger Bank|1915.07
Gallipoli|1915.15
Neuve Chapelle|1915.2
Isonzo|1915.47
Loos|1915.73
*Verdun|1916.14
Jutland|1916.41
Brusilov Offensive|1916.42|Brusilov
*The Somme|1916.5
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
Valmy|1792
Toulon|1793|Siege of Toulon
Lodi|1796
Arcole|1796.8
Rivoli|1797
The Pyramids|1798
The Nile|1798.6|Aboukir Bay
Marengo|1800
Copenhagen|1801
*Trafalgar|1805.8
Ulm|1805.79
*Austerlitz|1805.92
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
*Waterloo|1815.47`);

  L('crusades', 3, 'Name a crusade.', 'when it set out', [1099, 1204], `
People's Crusade|1096|Peasants' Crusade
*First Crusade|1096.5
Second Crusade|1147
Northern Crusades|1147.5|Baltic Crusades;Northern Crusade;Baltic Crusade
*Third Crusade|1189
Fourth Crusade|1202
Albigensian Crusade|1209|Cathar Crusade
Children's Crusade|1212
Fifth Crusade|1217
Sixth Crusade|1228
Seventh Crusade|1248
Eighth Crusade|1270
Ninth Crusade|1271|Lord Edward's Crusade`);

  L('thirteen-colonies', 3, 'Name one of the Thirteen Colonies.', 'founding', [1630, 1664], `
*Virginia|1607
*Massachusetts|1620|Massachusetts Bay;Plymouth
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
*Otto von Bismarck|1871
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
*Adolf Hitler|1933
*Konrad Adenauer|1949
Ludwig Erhard|1963
Kurt Georg Kiesinger|1966
Willy Brandt|1969
Helmut Schmidt|1974
Helmut Kohl|1982
Gerhard Schröder|1998|Schroeder
*Angela Merkel|2005
Olaf Scholz|2021
Friedrich Merz|2025`, 'P');

  L('civil-war-battles', 3, 'Name a battle of the American Civil War.', 'when it was fought', [1861.99, 1863.49], `
*Fort Sumter|1861.28|Sumter
Bull Run|1861.55|Manassas;First Bull Run
Fort Donelson|1862.12
Hampton Roads|1862.19|Monitor and Merrimack
Shiloh|1862.27
Seven Days|1862.48|Seven Days Battles
*Antietam|1862.71|Sharpsburg
Fredericksburg|1862.95
Stones River|1863|Murfreesboro
Chancellorsville|1863.33
Vicksburg|1863.38|Siege of Vicksburg
*Gettysburg|1863.5
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
*Neil Armstrong|1969.55
*Buzz Aldrin|1969.56|Edwin Aldrin
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
  V('eng-monarchs-medieval', 'eng-monarchs', 2, 'Name a king of England crowned between 1066 and 1485.', [1154, 1327], 1066, 1485);
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
      var star = name.charAt(0) === '*';
      if (star) name = name.slice(1);
      var approx = y.charAt(0) === '~';
      if (approx) y = y.slice(1);
      out.push({ name: name, year: parseFloat(y), approx: approx, star: star,
        alts: f[2] ? f[2].split(';').map(function (x) { return x.trim(); }).filter(Boolean) : [],
        key: def.id + ':' + name });
    });
    return out;
  }

  function damage(year, cut) { return year <= cut[0] ? 3 : year <= cut[1] ? 2 : 1; }

  function makePrompt(def, family, source, people, by) {
    var inside = [], outside = [];
    source.forEach(function (a) {
      var ok = (def.from == null || a.year >= def.from) && (def.to == null || a.year <= def.to) &&
        (!def.pattern || def.pattern.test(a.name));
      if (!ok) { outside.push(a); return; }
      inside.push({ name: a.name, year: a.year, approx: a.approx, star: a.star, alts: a.alts, key: a.key, dmg: damage(a.year, def.cut) });
    });
    var total = inside.reduce(function (s, a) { return s + a.dmg; }, 0);
    return { id: def.id, family: family, tier: def.tier, q: def.q, by: by, cut: def.cut.slice(), people: people,
      answers: inside, outside: outside, total: total, hpCap: Math.max(3, Math.floor(total / 2)) };
  }

  /** Expand the rolls into the list of questions the game draws from. */
  function buildBank() {
    var bank = [], rolls = {};
    LISTS.forEach(function (def) {
      var roll = rolls[def.id] = { def: def, answers: parseRoll(def) };
      bank.push(makePrompt(def, def.id, roll.answers, def.people, def.by));
    });
    VARIANTS.forEach(function (def) {
      var roll = rolls[def.base];
      if (!roll) throw new Error('variant ' + def.id + ' has no roll ' + def.base);
      bank.push(makePrompt(def, def.base, roll.answers, roll.def.people, roll.def.by));
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
})(typeof globalThis !== 'undefined' ? globalThis : this);
