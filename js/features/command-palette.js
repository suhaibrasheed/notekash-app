export const commandPalette = {
                state: {
                    textileColors: [
                        // 9 Premium Color Styles: Lavender, Mint, Sun, Rose, Sky, Amber, Stone, Crimson, Indigo
                        '1', '2', '3', '4', '5', '6', '7', '8', '9'
                    ],
                    isOpen: false,
                    commands: [],
                    filteredResults: [],
                    selectedIndex: 0,
                    fuse: {
                        commands: null,
                        links: null,
                        categories: null,
                        tags: null,
                        emojis: null,
                        icons: null,
                    },
                    mode: 'commands',
                    emojiData: [],
                    iconData: [],
                    isFetching: false,
                    highlightOptions: [
                        { id: 'yellow', title: 'Yellow Highlight', desc: 'Standard yellow background', icon: '🟨', className: 'highlight-1' },
                        { id: 'green', title: 'Green Highlight', desc: 'Soothing green background', icon: '🟩', className: 'highlight-2' },
                        { id: 'blue', title: 'Blue Highlight', desc: 'Cool blue background', icon: '🟦', className: 'highlight-3' },
                        { id: 'red', title: 'Red Highlight', desc: 'Urgent red background', icon: '🟥', className: 'highlight-4' },
                        { id: 'purple', title: 'Purple Highlight', desc: 'Royal purple background', icon: '🟪', className: 'highlight-5' },
                        { id: 'cyan', title: 'Cyan Highlight', desc: 'Light cyan background', icon: '💠', className: 'highlight-6' },
                        { id: '1', title: 'Red Text', desc: 'Apply red text color', icon: 'T', className: 'text-red' },
                        { id: '2', title: 'Green Text', desc: 'Apply green text color', icon: 'T', className: 'text-green' },
                        { id: '3', title: 'Blue Text', desc: 'Apply blue text color', icon: 'T', className: 'text-blue' },
                        { id: 'clear', title: 'Clear Highlight', desc: 'Remove all block highlights', icon: '❌', className: '' },
                    ],
                    // FIX: State for debouncing API calls and storing the highlight target
                    debounceTimeout: null,
                    targetBlockElement: null,
                },
                els: {
                    palette: null,
                    input: null,
                    list: null,
                },

                // 🚀 COMPREHENSIVE EMOJI GENERATOR - 2000+ emojis with smart names & keywords!
                _generateEmojiData() {
                    const emojis = [];

                    // Smart emoji naming based on Unicode codepoint ranges
                    const getEmojiName = (code, rangeStart, rangeEnd, baseName) => {
                        const offset = code - rangeStart;
                        const totalInRange = rangeEnd - rangeStart + 1;

                        // Return descriptive name with variation number if range is large
                        if (totalInRange > 20) {
                            return `${baseName} ${offset + 1}`;
                        }
                        return baseName;
                    };

                    // Comprehensive Unicode emoji ranges with names and searchable keywords
                    const ranges = [
                        // === SMILEYS & PEOPLE ===
                        { start: 0x1F600, end: 0x1F64F, name: 'Smiley', keywords: 'face emotion smile happy sad angry laugh cry wink love kiss heart eyes grin beam joy tears blush cool sunglasses smirk worried scared surprised shocked thinking wondering neutral expressionless unamused rolling laughing rofl halo angel devil demon clown cowboy nerd monocle disgusted vomit sneeze sick mask thermometer bandage sleeping zzz dreaming yawn tired sleepy relieved pleased satisfied pensive thoughtful frowning disappointed confused slight anxious nervous stressed sweat drooling money mouth zipper no speak evil hear see monkey' },

                        // === GESTURES & BODY PARTS ===
                        { start: 0x1F44B, end: 0x1F4FF, name: 'Hand Gesture', keywords: 'hand wave hello goodbye bye thumbs up down like dislike ok okay good bad yes no stop palm raised high five pray thank namaste clap applause muscle strong flex bicep punch fist bump point finger left right up down victory peace sign horn love rock metal writing write pen pencil nail polish paint selfie ear nose eye eyes brain tooth bone leg foot footprint lips kiss mouth tongue' },

                        // === ANIMALS & NATURE ===
                        { start: 0x1F400, end: 0x1F43F, name: 'Animal', keywords: 'animal pet wild zoo farm cute rat mouse hamster rabbit bunny bear panda polar koala tiger lion cat kitty kitten dog puppy pup wolf fox raccoon monkey gorilla orangutan chimp whale dolphin fish shark octopus shell snail butterfly bug bee ant beetle ladybug cricket spider web scorpion mosquito fly worm microbe bacteria virus' },
                        { start: 0x1F980, end: 0x1F9AE, name: 'Creature', keywords: 'animal crab lobster shrimp squid oyster bird dove eagle duck swan goose peacock parrot owl flamingo penguin bat dinosaur t-rex dragon unicorn horse zebra deer giraffe elephant rhino hippo kangaroo badger turkey chicken rooster hatching chick baby nest egg shark crocodile lizard snake turtle frog hedgehog llama alpaca camel dromedary sloth otter skunk' },

                        // === FOOD & DRINK ===
                        { start: 0x1F32D, end: 0x1F37F, name: 'Food', keywords: 'food eat meal breakfast lunch dinner snack fast burger pizza hot dog sandwich taco burrito wrap salad pasta spaghetti ramen noodle soup bowl rice curry stew meat chicken poultry turkey bacon egg cooking fried pancake waffle cheese bread croissant baguette pretzel bagel cookie cake birthday cupcake pie chocolate candy lollipop caramel honey apple fruit berry strawberry grape melon watermelon lemon lime orange tangerine banana pineapple kiwi coconut avocado eggplant potato carrot corn pepper cucumber broccoli leafy green peanut chestnut coffee tea cup mug beer wine champagne cocktail drink beverage juice milk baby bottle water sake martini tumbler glass tropical cheers toast' },
                        { start: 0x1F950, end: 0x1F9FF, name: 'Snack', keywords: 'food croissant avocado cucumber broccoli peanuts kiwi pancakes dumpling fortune cookie takeout bento box crab lobster shrimp squid oyster soft ice cream donut birthday cake cupcake pie chocolate candy lollipop custard honey jar milk glass baby bottle tea coffee beverage hot drink mate bagel salt pretzel popcorn butter waffle falafel egg fried cooking bacon cheese wedge moon cake red envelope chopsticks bowl spoon fork knife amphora jar box cup straw bubble mate teacup wine cocktail tropical beer mugs clinking glasses tumbler pouring liquid' },

                        // === ACTIVITIES & SPORTS ===
                        { start: 0x1F3A0, end: 0x1F3FF, name: 'Activity', keywords: 'activity sport game play fun entertainment carnival circus carousel ferris wheel roller coaster fishing pole fish video game controller joystick dice slot machine jigsaw puzzle teddy bear pinata nesting dolls balloon party popper confetti ribbon wrapped gift christmas present birthday bow soccer football basketball baseball softball tennis volleyball rugby golf cricket hockey lacrosse ping pong badminton boxing glove martial arts karate judo wrestling fencing goal net award medal trophy sports champion win first second third podium running runner race track athlete sprint marathon swimming pool swim dive surf skiing skier snowboard ice skate sled curling archery arrow darts yo-yo kite parachute skateboard roller inline artistic gymnast lift weight lifter bicycle bike mountain road shirt play button pause stop record eject shuffle repeat loop arrows musical note music song tune melody rhythm beat drum guitar piano keyboard violin trumpet saxophone clue magnifying glass detective spy investigate search find magnify inspect examine movie film cinema camera video photo picture image snapshot flash lens tripod clapper board director action cut scene theater stage curtain performing arts ballet dance disco ball art palette artist paint brush crayon sketching drawing coloring creative design frame painting sculpture statue museum gallery exhibition masterpiece microphone singer karaoke perform concert headphone speaker audio sound volume loud quiet mute hear listen stereo radio broadcast antenna satellite receiver transmitter signal wave frequency channel ticket admission event show performance magic top hat rabbit trick illusion sleight hand celebration festival fair amusement park ride attraction thrill excitement joy happiness celebration achievement success victory triumph accomplishment goal objective target aim focus determination motivation inspiration aspiration dream hope wish desire want need love passion enthusiasm thrill adventure explore discovery journey travel voyage trip vacation holiday getaway escape relaxation leisure rest break recharge rejuvenate refresh renew revive restore recover heal mend fix repair improve enhance upgrade develop grow evolve progress advance forward onward upward rise ascent climb scale conquer achieve accomplish succeed prevail champion best top excellent outstanding remarkable exceptional extraordinary magnificent superb splendid wonderful marvelous fabulous terrific great good nice pleasant enjoyable delightful charming lovely beautiful pretty attractive gorgeous stunning breathtaking spectacular amazing awesome incredible unbelievable astonishing astounding surprising shocking startling unexpected sudden abrupt instant immediate quick fast rapid swift speedy hasty hurried rushed urgent pressing critical crucial vital essential important significant major key primary main principal chief leading foremost paramount supreme ultimate final conclusive definitive decisive determinative authoritative commanding controlling dominant prevailing ruling governing reigning sovereign' },

                        // === TRAVEL & PLACES ===
                        { start: 0x1F680, end: 0x1F6FF, name: 'Transport', keywords: 'travel place transport vehicle trip journey vacation car auto automobile taxi cab police ambulance fire truck bus trolley tram train railway locomotive metro subway station rail track monorail mountain aerial tramway suspension cable helicopter airplane plane flight fly aviation airport departure arrival takeoff landing pilot airline jet rocket space satellite astronaut alien ufo flying saucer ship boat ferry sailboat speedboat yacht cruise sailing anchor port harbor dock marina water sea ocean wave beach coast shore sand island tropical paradise destination getaway escape adventure explore discover voyage expedition tour sightseeing landmark monument building architecture house home city town village urban rural countryside landscape scenery view panorama horizon skyline cityscape street road highway freeway motorway boulevard avenue lane alley path trail walkway sidewalk pavement bridge tunnel viaduct overpass underpass intersection junction crossroad roundabout traffic light signal sign stop yield caution warning danger hazard construction work zone area region district neighborhood community locality vicinity proximity near close adjacent neighboring surrounding' },

                        // === OBJECTS & TOOLS ===
                        { start: 0x1F4A0, end: 0x1F4FF, name: 'Object', keywords: 'object tool item thing stuff equipment gear apparatus device instrument gadget contraption machine mechanism widget gizmo diamond gem jewel precious stone crystal sparkle shine glitter gleam glisten shimmer twinkle brilliant dazzling radiant luminous bright light illumination glow lamp lantern candle torch flashlight beam ray shaft streak flash flare burst explosion blast boom bang crash smash shatter break fracture crack split rupture tear rip cut slash gash wound injury hurt pain ache throb sting burn scorch char singe sear scald blister peel skin flesh tissue muscle tendon ligament bone skeleton skull cranium brain mind intellect intelligence wisdom knowledge understanding comprehension awareness consciousness perception cognition thought thinking reasoning logic rationality sense sensibility judgment discernment discrimination taste refinement culture cultivation education learning study scholarship erudition literacy proficiency competence skill ability capability capacity faculty talent gift aptitude knack flair genius brilliance excellence mastery expertise professionalism craft craftsmanship artistry workmanship quality standard grade level degree measure extent magnitude size dimension proportion scale ratio rate speed velocity pace tempo rhythm beat pulse throb pulsation vibration oscillation fluctuation variation change modification alteration adjustment adaptation transformation conversion' },

                        // === SYMBOLS & ICONS ===
                        { start: 0x2600, end: 0x26FF, name: 'Symbol', keywords: 'symbol icon sign mark emblem logo badge seal stamp crest insignia flag banner pennant standard colors ensign holy sacred religious spiritual divine celestial heavenly supernatural mystical magical enchanted charmed blessed pure innocent virgin chaste modest humble meek gentle mild soft tender delicate fragile frail weak feeble infirm sickly ill unwell ailing diseased infected contaminated polluted tainted corrupted spoiled rotten decayed decomposed putrid foul nasty disgusting revolting repulsive repugnant offensive objectionable unpleasant disagreeable distasteful unsavory unpalatable inedible uneatable toxic poisonous venomous deadly lethal fatal mortal terminal incurable hopeless desperate dire critical severe serious grave solemn somber sad sorrowful mournful melancholy gloomy dismal dreary bleak dark dim shadowy murky obscure vague unclear ambiguous uncertain doubtful questionable dubious suspicious fishy shady dodgy iffy sketchy unreliable untrustworthy dishonest deceitful deceptive misleading fraudulent fake false counterfeit bogus phony sham pretend mock imitation replica copy duplicate clone facsimile reproduction representation depiction portrayal illustration drawing picture image likeness resemblance similarity correspondence analogy parallel comparison contrast difference distinction variation diversity variety assortment selection range array collection set group cluster bunch batch lot load heap pile stack mound mountain hill summit peak pinnacle apex zenith acme climax culmination height top crest crown cap head brain mind intellect sun moon star cloud rain weather storm thunder lightning bolt electricity power energy force strength might vigor vitality fire flame hot warm cool cold freeze ice snow winter summer spring autumn fall season time period era age epoch cycle circle eternal infinity universe cosmos galaxy planet earth world globe sphere ball round circular oval elliptical curved bent twisted spiral helix coil loop ring band hoop wheel disk disc plate platter tray dish bowl cup mug glass tumbler goblet chalice grail vessel container receptacle holder box chest trunk case crate barrel drum cylinder tube pipe hose conduit duct channel passage corridor hallway hall aisle gangway walkway path trail track route way road street avenue boulevard lane alley court yard garden park plaza square marketplace bazaar souk mall center arcade gallery colonnade portico porch veranda balcony terrace deck patio courtyard atrium foyer lobby entrance entry doorway portal gate gateway arch archway threshold sill lintel jamb frame border edge margin rim brim lip brink verge periphery boundary frontier limit confine bound checkpoint barrier fence wall partition screen divider separator hedge row line queue column file rank tier layer stratum level story floor ceiling roof rafters beams joists studs posts pillars columns supports foundations footings base bottom underneath below under beneath down low lower depth deep abyss chasm gorge canyon ravine gulch gully valley dell hollow basin depression dip indent notch nick scratch scar blemish flaw defect fault imperfection' },
                        { start: 0x2700, end: 0x27BF, name: 'Dingbat', keywords: 'symbol dingbat ornament decoration embellishment adornment trim trimming edging border fringe ribbon bow knot tie band strap belt sash girdle waistband cincture zone area region district sector quarter ward precinct parish township municipality county province state territory dominion realm kingdom empire nation country land homeland fatherland motherland native soil ground earth dirt dust powder grain particle speck mote fleck dot spot point mark sign token indication evidence proof testimony witness attestation certification verification validation confirmation corroboration substantiation authentication legitimation accreditation endorsement approval sanction authorization permission consent assent agreement acceptance acknowledgment recognition admission concession grant allowance dispensation exemption exception exclusion omission oversight neglect disregard ignorance unawareness unconsciousness obliviousness insensibility numbness paralysis immobility immobilization fixation stabilization consolidation solidification crystallization fossilization petrification ossification calcification hardening stiffening rigidity inflexibility stubbornness obstinacy determination resolution resolve commitment dedication devotion loyalty allegiance fidelity faithfulness constancy steadfastness reliability dependability trustworthiness honesty integrity probity rectitude righteousness virtue morality ethics principles values ideals standards benchmarks criteria measures tests trials examinations assessments evaluations appraisals judgments verdicts decisions rulings pronouncements declarations proclamations announcements notifications communications messages dispatches bulletins advisories alerts warnings cautions admonitions reprimands rebukes reproaches criticisms condemnations denunciations censures' },

                        // === HEARTS & EMOTIONS ===
                        { start: 0x2763, end: 0x2764, name: 'Heart', keywords: 'heart love romance passion affection emotion feeling sentiment care compassion empathy sympathy kindness tenderness warmth fondness attachment devotion adoration infatuation crush sweetheart lover beloved darling dear honey sweet valentine wedding marriage engagement relationship couple partnership bond connection tie link union togetherness closeness intimacy courtship dating flirting attraction chemistry spark flame fire burning desire longing yearning craving hunger thirst want need wish hope dream fantasy imagination vision aspiration ambition goal objective target aim purpose mission quest search pursuit hunt chase follow track trail stalk shadow tail dog hound pursue seek look find discover uncover reveal expose disclose divulge betray tell confess admit acknowledge accept recognize realize understand comprehend grasp fathom appreciate value treasure cherish prize esteem respect honor revere worship adore idolize glorify exalt praise laud commend applaud acclaim celebrate tribute homage' },

                        // === FLAGS ===
                        { start: 0x1F1E6, end: 0x1F1FF, name: 'Flag', keywords: 'flag country nation state territory region area place location position spot site locale venue setting scene backdrop background context situation circumstance condition status phase stage step level degree extent measure magnitude size dimension proportion scale ratio rate percentage fraction portion share part piece segment section division subdivision category class group type kind sort variety species genus family order phylum kingdom domain realm sphere field discipline subject topic theme matter issue question problem challenge difficulty obstacle hurdle barrier impediment hindrance obstruction blockage jam congestion traffic gridlock deadlock stalemate impasse standoff Mexican American Canadian British English French German Italian Spanish Russian Chinese Japanese Korean Indian Brazilian Australian European Asian African' },

                        // === CLOCKS & TIME ===
                        { start: 0x1F550, end: 0x1F567, name: 'Clock', keywords: 'clock time hour minute second watch timer alarm schedule timetable calendar date day week month year morning afternoon evening night midnight noon midday dawn dusk twilight sunrise sunset daybreak nightfall early late soon delayed urgent pressing immediate instant quick fast rapid swift speedy hasty prompt punctual timely opportune convenient suitable appropriate fitting proper right correct accurate precise exact specific particular special unique individual personal private confidential secret hidden concealed obscured veiled masked disguised camouflaged' },

                        // === WEATHER ===
                        { start: 0x1F324, end: 0x1F32C, name: 'Weather', keywords: 'weather climate temperature hot cold warm cool heat freeze rain snow sleet hail thunder lightning storm hurricane tornado cyclone typhoon blizzard flood drought sun sunny cloud cloudy overcast gray grey foggy misty hazy clear bright dark wind windy breeze gale gust calm still quiet peaceful serene tranquil placid smooth gentle mild moderate extreme severe harsh brutal intense fierce violent wild turbulent chaotic disorderly messy untidy' },

                        // === ZODIAC ===
                        { start: 0x2648, end: 0x2653, name: 'Zodiac', keywords: 'zodiac astrology horoscope sign star constellation aries ram taurus bull gemini twins cancer crab leo lion virgo maiden libra scales scorpio scorpion sagittarius archer capricorn goat aquarius water bearer pisces fish birth birthday date month celestial heaven sky space universe cosmos galaxy planet star moon sun solar lunar eclipse equinox solstice season spring summer autumn fall winter' },

                        // === ARROWS & DIRECTIONS ===
                        { start: 0x2190, end: 0x21FF, name: 'Arrow', keywords: 'arrow direction point indicate show guide lead navigate orient position locate situate place put set lay rest stand sit down up left right north south east west forward backward ahead behind front rear top bottom side edge corner angle diagonal vertical horizontal perpendicular parallel straight curved bent twisted spiral circular round oval elliptical' },

                        // === MATH & NUMBERS ===
                        { start: 0x2460, end: 0x24FF, name: 'Number', keywords: 'number digit numeral figure count amount quantity sum total aggregate whole entire complete full finished done ready prepared set arranged organized systematic orderly neat tidy clean pure simple plain basic fundamental essential primary main principal chief leading foremost paramount supreme ultimate final conclusive definitive decisive determinative zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion trillion math mathematics arithmetic algebra geometry calculus statistics probability logic reasoning calculation computation' },

                        // === OFFICE & WRITING ===
                        { start: 0x270F, end: 0x2712, name: 'Writing Tool', keywords: 'write writing pencil pen ink marker highlighter crayon chalk pastel charcoal brush paint draw sketch doodle scribble jot note record document paper page sheet leaf notebook journal diary log book volume tome manuscript script text copy draft outline plan blueprint diagram chart graph table list inventory catalog index directory register roll roster schedule agenda calendar planner organizer office desk work workspace workplace business corporate professional formal official administrative clerical secretarial' },

                        // === MUSIC ===
                        { start: 0x1F3B5, end: 0x1F3BC, name: 'Music', keywords: 'music musical note song tune melody harmony rhythm beat tempo pulse sound audio acoustic sonic auditory hearing listen ear play perform sing dance disco party celebration festival concert show gig performance recital presentation exhibition display demonstration theater stage curtain spotlight limelight fame celebrity star superstar icon legend hero idol role model inspiration motivation encouragement support help assist aid' },

                        // === ADDITIONAL FACES & EXPRESSIONS ===
                        { start: 0x1F910, end: 0x1F92F, name: 'Face', keywords: 'face expression emotion feeling mood zipper mouth money monocle nerd geek cowboy clown lying pinocchio drool sick thermometer head injury bandage sneeze tissue cold flu virus bacteria germ infection disease illness sickness ailment malady affliction disorder condition syndrome complaint problem issue trouble difficulty complication' },

                        // === SUPPLEMENTAL SYMBOLS ===
                        { start: 0x1F300, end: 0x1F320, name: 'Nature Symbol', keywords: 'nature natural environment ecological green eco sustainable renewable organic earth planet world globe universe cosmos space galaxy star moon sun solar lunar celestial heaven sky cloud rain rainbow weather climate atmosphere air wind breeze storm hurricane tornado cyclone typhoon monsoon flood drought earthquake volcano tsunami' }
                    ];

                    // Generate emojis with unique names and comprehensive keywords
                    ranges.forEach(range => {
                        for (let code = range.start; code <= range.end; code++) {
                            const emoji = String.fromCodePoint(code);
                            const name = getEmojiName(code, range.start, range.end, range.name);
                            emojis.push({
                                e: emoji,
                                name: name,
                                k: range.keywords
                            });
                        }
                    });

                    return emojis;
                },

                _generateIconData() {
                    // 150+ Font Awesome icons in ultra-compact format: [name, keywords]
                    const ic = [
                        // UI & Actions (20)
                        ['heart', 'love like favorite'], ['star', 'favorite rating important'], ['fire', 'hot trending'], ['bolt', 'lightning fast power'],
                        ['check', 'done complete success'], ['xmark', 'close delete cancel'], ['plus', 'add new create'], ['minus', 'remove less'],
                        ['bars', 'menu hamburger'], ['ellipsis', 'more options'], ['gear', 'settings config'], ['sliders', 'adjust controls'],
                        ['bell', 'notification alert'], ['bookmark', 'save mark'], ['flag', 'report mark'], ['tag', 'label'],
                        ['share', 'send export'], ['download', 'save get'], ['upload', 'send put'], ['link', 'chain url'],

                        // Navigation & Arrows (18)
                        ['arrow-up', 'up north top'], ['arrow-down', 'down south bottom'], ['arrow-left', 'left west back'], ['arrow-right', 'right east forward'],
                        ['chevron-up', 'up collapse'], ['chevron-down', 'down expand'], ['chevron-left', 'left previous'], ['chevron-right', 'right next'],
                        ['angle-up', 'up'], ['angle-down', 'down'], ['angle-left', 'left'], ['angle-right', 'right'],
                        ['circle-up', 'up'], ['circle-down', 'down'], ['circle-left', 'left'], ['circle-right', 'right'],

                        // Shapes & Symbols (15)
                        ['circle', 'round dot'], ['square', 'box'], ['diamond', 'gem'], ['heart', 'love'],
                        ['star', 'rating'], ['sun', 'light day'], ['moon', 'night dark'], ['cloud', 'weather'], ['droplet', 'water'],
                        ['hashtag', 'tag number'], ['at', 'email mention'], ['percent', 'discount'], ['dollar-sign', 'money price'], ['infinity', 'unlimited'],

                        // Content & Media (18)
                        ['image', 'picture photo'], ['video', 'film movie'], ['music', 'audio sound'], ['file', 'document'], ['file-lines', 'document text'],
                        ['folder', 'directory'], ['folder-open', 'directory'], ['book', 'read library'], ['newspaper', 'news article'],
                        ['pen', 'write edit'], ['pencil', 'write draw'], ['paintbrush', 'art draw'], ['highlighter', 'mark'],
                        ['scissors', 'cut'], ['copy', 'duplicate'], ['paste', 'insert'], ['rotate', 'refresh reload'], ['crop', 'trim'],

                        // Communication (12)
                        ['envelope', 'email mail'], ['comment', 'message chat'], ['comments', 'discussion'], ['phone', 'call'], ['paper-plane', 'send'],
                        ['inbox', 'mail'], ['microphone', 'voice audio'], ['video', 'camera'], ['user', 'person profile'], ['users', 'people group'],
                        ['address-book', 'contacts'], ['id-card', 'profile identity'],

                        // Time & Calendar (8)
                        ['clock', 'time'], ['calendar', 'date schedule'], ['calendar-days', 'dates events'], ['stopwatch', 'timer'],
                        ['hourglass', 'waiting time'], ['history', 'past recent'], ['sun', 'morning day'], ['moon', 'evening night'],

                        // Places & Travel (15)
                        ['house', 'home'], ['building', 'office work'], ['city', 'urban'], ['mountain', 'nature outdoor'], ['tree', 'nature forest'],
                        ['location-dot', 'place pin'], ['map', 'location navigation'], ['compass', 'direction'], ['globe', 'world earth'],
                        ['plane', 'flight travel'], ['car', 'vehicle drive'], ['train', 'railway'], ['ship', 'boat sea'], ['bicycle', 'bike'], ['rocket', 'space launch'],

                        // Objects & Tools (18)
                        ['magnifying-glass', 'search find'], ['key', 'password access'], ['lock', 'secure private'], ['unlock', 'open access'],
                        ['shield', 'security protect'], ['trash', 'delete remove'], ['box', 'package container'], ['wrench', 'tool fix'],
                        ['hammer', 'tool build'], ['screwdriver', 'tool'], ['briefcase', 'work business'], ['suitcase', 'travel luggage'],
                        ['gift', 'present'], ['trophy', 'award win'], ['medal', 'achievement'], ['crown', 'king premium'], ['wand-magic', 'magic'], ['puzzle-piece', 'plugin addon'],

                        // Status & Alerts (12)
                        ['circle-check', 'success done'], ['circle-xmark', 'error failed'], ['circle-exclamation', 'warning alert'], ['circle-info', 'info help'],
                        ['triangle-exclamation', 'warning caution'], ['question', 'help unknown'], ['lightbulb', 'idea'], ['battery-full', 'power charged'],
                        ['wifi', 'internet connection'], ['signal', 'connection strength'], ['eye', 'view visible'], ['eye-slash', 'hidden invisible'],

                        // Food & Nature (12)
                        ['mug-hot', 'coffee tea drink'], ['utensils', 'food eat'], ['pizza-slice', 'food pizza'], ['burger', 'food'], ['apple', 'fruit'],
                        ['carrot', 'vegetable'], ['leaf', 'nature plant'], ['seedling', 'grow plant'], ['bug', 'insect'], ['paw', 'pet animal'],
                        ['fish', 'sea animal'], ['feather', 'bird light'],

                        // Weather (8)
                        ['cloud-sun', 'partly cloudy'], ['cloud-rain', 'rainy'], ['cloud-bolt', 'storm thunder'], ['snowflake', 'snow cold'],
                        ['temperature-high', 'hot heat'], ['temperature-low', 'cold'], ['wind', 'breeze'], ['umbrella', 'rain protection'],

                        // Social & Brands (10)
                        ['thumbs-up', 'like approve'], ['thumbs-down', 'dislike'], ['hand-peace', 'peace'], ['handshake', 'deal agreement'],
                        ['face-smile', 'happy emoji'], ['face-frown', 'sad emoji'], ['face-laugh', 'laugh emoji'], ['face-angry', 'angry emoji'],
                        ['universal-access', 'accessibility'], ['wheelchair', 'accessible'],

                        // Business & Finance (8)
                        ['chart-line', 'growth analytics'], ['chart-pie', 'statistics'], ['coins', 'money currency'], ['credit-card', 'payment'],
                        ['wallet', 'money finance'], ['receipt', 'bill invoice'], ['scale-balanced', 'law justice'], ['gavel', 'legal court']
                    ];

                    return ic.map(([n, k]) => ({ icon: n, class: `fa-solid fa-${n}`, k }));
                },

                init() {
                    this.els.palette = document.getElementById('command-palette');
                    this.els.input = document.getElementById('command-palette-input');
                    this.els.list = document.getElementById('command-palette-list');
                    this.els.preview = document.getElementById('command-palette-preview');

                    document.addEventListener('click', (e) => {
                        // --- VIDEO DELETE HANDLER ---
                        const deleteVideoBtn = e.target.closest('.nk-video-delete-btn');
                        if (deleteVideoBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            const embed = deleteVideoBtn.closest('.nk-video-embed');
                            if (embed) {
                                embed.remove();
                                App.state.isArticleDirty = true;
                                App.ui.showToast('Video removed', { type: 'info' });
                            }
                        }

                        // --- VIDEO ALIGN HANDLER ---
                        const alignVideoBtn = e.target.closest('.nk-video-align-btn');
                        if (alignVideoBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            const embed = alignVideoBtn.closest('.nk-video-embed');
                            if (embed) {
                                embed.classList.toggle('align-left');
                                const icon = alignVideoBtn.querySelector('i');
                                if (embed.classList.contains('align-left')) {
                                    alignVideoBtn.title = "Revert to Center Mode";
                                    if (icon) {
                                        icon.classList.remove('fa-align-left');
                                        icon.classList.add('fa-align-center');
                                    }
                                    App.ui.showToast('Newspaper mode active', { type: 'info' });
                                } else {
                                    alignVideoBtn.title = "Switch to Newspaper Mode";
                                    if (icon) {
                                        icon.classList.remove('fa-align-center');
                                        icon.classList.add('fa-align-left');
                                    }
                                    App.ui.showToast('Center mode active', { type: 'info' });
                                }
                                App.state.isArticleDirty = true;
                            }
                        }

                        // --- MAP DELETE HANDLER ---
                        const deleteMapBtn = e.target.closest('.nk-map-delete-btn');
                        if (deleteMapBtn) {
                            e.preventDefault();
                            e.stopPropagation();
                            const embed = deleteMapBtn.closest('.nk-map-embed');
                            if (embed) {
                                embed.remove();
                                App.state.isArticleDirty = true;
                                App.ui.showToast('Map removed', { type: 'info' });
                            }
                        }
                    });

                    // --- VIDEO FOCUS & DELETE KEYBOARD HANDLER ---
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                            const focused = document.activeElement;
                            if (focused && focused.classList.contains('nk-video-embed')) {
                                e.preventDefault();
                                e.stopPropagation();
                                focused.remove();
                                App.state.isArticleDirty = true;
                                App.ui.showToast('Video removed', { type: 'info' });
                            }
                            if (focused && focused.classList.contains('nk-map-embed')) {
                                e.preventDefault();
                                e.stopPropagation();
                                focused.remove();
                                App.state.isArticleDirty = true;
                                App.ui.showToast('Map removed', { type: 'info' });
                            }
                        }
                    });

                    this.state.isPreviewActive = false;
                    this.state.originalContentState = null;
                    this.state.previewTimeout = null;

                    this.state.fontFamilyOptions = [
                        // --- 11 OFFLINE SYSTEM FONTS (FREE) ---
                        { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
                        { name: 'Cambria', value: 'Cambria, Cochin, Georgia, Times, "Times New Roman", serif' },
                        { name: 'Courier New', value: "'Courier New', Courier, monospace" },
                        { name: 'Garamond', value: 'Garamond, serif' },
                        { name: 'Georgia', value: 'Georgia, serif' },
                        { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
                        { name: 'Monaco', value: 'Monaco, "Lucida Console", monospace' },
                        { name: 'Palatino', value: 'Palatino, "Palatino Linotype", serif' },
                        { name: 'Sans-Serif', value: 'sans-serif' },
                        { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
                        { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },

                        // --- 38 GOOGLE WEB FONTS (PREMIUM) ---
                        { name: 'Allura', value: 'Allura, cursive' },
                        { name: 'Arvo', value: 'Arvo, serif' },
                        { name: 'Bitter', value: 'Bitter, serif' },
                        { name: 'Cabin', value: 'Cabin, sans-serif' },
                        { name: 'Cabin Sketch', value: "'Cabin Sketch', cursive" },
                        { name: 'Changa One', value: "'Changa One', cursive" },
                        { name: 'Cinzel', value: 'Cinzel, serif' },
                        { name: 'Crimson Text', value: "'Crimson Text', serif'" },
                        { name: 'Dancing Script', value: "'Dancing Script', cursive" },
                        { name: 'Exo 2', value: "'Exo 2', sans-serif" },
                        { name: 'Fira Code', value: "'Fira Code', monospace" },
                        { name: 'Great Vibes', value: "'Great Vibes', cursive" },
                        { name: 'Inconsolata', value: 'Inconsolata, monospace' },
                        { name: 'Jersey 20', value: "'Jersey 20', sans-serif" },
                        { name: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
                        { name: 'Kaushan Script', value: "'Kaushan Script', cursive" },
                        { name: 'Lato', value: 'Lato, sans-serif' },
                        { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
                        { name: 'Lobster', value: 'Lobster, cursive' },
                        { name: 'Merriweather', value: 'Merriweather, serif' },
                        { name: 'Metal Mania', value: "'Metal Mania', cursive" },
                        { name: 'Montserrat', value: 'Montserrat, sans-serif' },
                        { name: 'Pacifico', value: 'Pacifico, cursive' },
                        { name: 'Parisienne', value: 'Parisienne, cursive' },
                        { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
                        { name: 'Playfair Display', value: "'Playfair Display', serif" },
                        { name: 'Protest Revolution', value: "'Protest Revolution', sans-serif" },
                        { name: 'Righteous', value: 'Righteous, cursive' },
                        { name: 'Roboto', value: 'Roboto, sans-serif' },
                        { name: 'Rochester', value: 'Rochester, cursive' },
                        { name: 'Salsa', value: 'Salsa, cursive' },
                        { name: 'Satisfy', value: 'Satisfy, cursive' },
                        { name: 'Sofia', value: 'Sofia, cursive' },
                        { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
                        { name: 'Special Elite', value: "'Special Elite', cursive" },
                        { name: 'Syne Mono', value: "'Syne Mono', monospace" },
                        { name: 'Ubuntu', value: 'Ubuntu, sans-serif' },
                        { name: 'Vollkorn', value: 'Vollkorn, serif' },
                        { name: 'Zilla Slab', value: "'Zilla Slab', serif" },
                    ];

                    // --- NEW EXPANDED FONT SIZES ---
                    this.state.fontSizeOptions = [
                        '0.8rem', '0.9rem', '1rem', '1.1rem', '1.2rem', '1.3rem', '1.4rem', '1.5rem', '1.6rem', '1.7rem', '1.8rem', '1.9rem', '2rem', '2.1rem', '2.2rem', '2.3rem', '2.4rem', '2.5rem', '3rem'
                    ];


                    this.state.commands = [
                        { id: 'link', title: 'Link to Note/Snippet', desc: 'e.g., link my other note', icon: '🔗', execute: () => { App.commandPalette.els.input.value = 'link '; App.commandPalette.filter(); } },
                        { id: 'whiteboard', title: 'Whiteboard / Ink', desc: 'Draw a sketch and insert it as an image', icon: '✒️', execute: () => App.whiteboard.open('cursor') },

                        { id: 'hig', title: 'Highlight Block', desc: 'e.g., hig yellow, hig 1', icon: '🎨' },
                        { id: 'define', title: 'Define Word', desc: 'e.g., define serendipity', icon: '📖' },

                        { id: 'category', title: 'Change Category', desc: 'e.g., category History', icon: '📂' },
                        { id: 'collapse', title: 'Collapsible Heading', desc: 'Make current heading/text collapsible', icon: '🔽', execute: () => App.commandPalette.toggleCollapse() },
                        { id: 'tag', title: 'Insert Existing Tag', desc: 'e.g., tag botany', icon: '🏷️' },
                        { id: 'record', title: 'Start/Stop Recording', desc: 'Record audio, or Transcribe it (if downloaded)', icon: '🎙️', execute: () => App.audio.toggleRecording() },

                        { id: 'clip', title: 'Clip Webpage', desc: 'e.g., clip https://example.com', icon: '✂️', isPremium: true },
                        { id: 'copy', title: 'Copy All Content', desc: 'Copy entire note exactly as it is', icon: '📋', execute: () => App.commandPalette.copyAllContents() },
                        { id: 'pastefast', title: 'Quick Paste', desc: 'Paste content, preserving styles except background', icon: '⚡️', execute: () => App.commandPalette.pasteFast() },
                        { id: 'onenoteimport', title: 'Import from OneNote', desc: 'Clean paste from OneNote', icon: '💜', execute: () => App.commandPalette.importOneNote() },
                        { id: 'video', title: 'Insert Video', desc: 'YT/X/Insta e.g. video https://...', icon: '🎬', execute: () => { App.commandPalette.els.input.value = 'video '; App.commandPalette.filter(); } },
                        { id: 'map', title: 'Insert Map', desc: 'e.g., map Paris, map earth India', icon: '🗺️', execute: () => { App.commandPalette.els.input.value = 'map '; App.commandPalette.filter(); } },
                        { id: 'emoji', title: 'Insert Emoji', desc: 'e.g., emoji smile', icon: '😀' },
                        { id: 'icon', title: 'Insert Icon', desc: 'e.g., icon heart (Font Awesome)', icon: '★' },
                        { id: 'img', title: 'External Image', desc: 'Use on URL, or img https://...', icon: '🔗' },
                        { id: 'table', title: 'Insert Table (dynamic)', desc: 'e.g., table 3x4', icon: '▦' },

                        { id: 'alignleft', title: 'Align Left', desc: 'Align text to the left', icon: '⬅️', execute: () => { document.execCommand('justifyLeft'); App.state.isArticleDirty = true; } },
                        { id: 'aligncenter', title: 'Align Center', desc: 'Center align text', icon: '↔️', execute: () => { document.execCommand('justifyCenter'); App.state.isArticleDirty = true; } },
                        { id: 'alignright', title: 'Align Right', desc: 'Align text to the right', icon: '➡️', execute: () => { document.execCommand('justifyRight'); App.state.isArticleDirty = true; } },
                        { id: 'table2col', title: 'Insert Table (2 Columns)', desc: 'Creates a standard 3x2 table', icon: '▦', execute: () => App.events.table.create(3, 2) },
                        { id: 'table3col', title: 'Insert Table (3 Columns)', desc: 'Creates a standard 3x3 table', icon: '▦', execute: () => App.events.table.create(3, 3) },
                        { id: 'chart', title: 'Insert Chart', desc: 'Create a bar, line, or pie chart', icon: '📊', execute: () => App.ui.showChartModal() },
                        { id: 'timeline', title: 'Insert Timeline', desc: 'Create a historical timeline block', icon: '⏳', execute: () => App.commandPalette.insertTimeline(), isPremium: true },
                        { id: 'mcq', title: 'Insert MCQ Block', desc: 'Create a multiple-choice question', icon: '❓', execute: () => App.commandPalette.insertMcqBlock(), isPremium: true },
                        { id: 'deck', title: 'Insert Decktile', desc: 'A container for multiple text tiles', icon: '🗂️', execute: () => App.commandPalette.insertTextileDeck(), isPremium: true },
                        { id: 'convert', title: 'Convert List to Deck', desc: 'Turns a bulleted list into a Decktile', icon: '🪄', execute: () => App.commandPalette.convertListToDeck(), isPremium: true },
                        { id: 'textile', title: 'Insert Text Tile', desc: 'e.g., textile My important quote', icon: '📝', execute: () => App.commandPalette.insertTextTile(), isPremium: true },
                        { id: 'copymcq', title: 'Copy All MCQs', desc: 'Copy all MCQs in format for Creator Studio', icon: '📋', execute: () => App.commandPalette.copyAllMcqs() },
                        { id: 'pastemcq', title: 'Paste MCQ', desc: 'Paste native MCQKash MCQs from clipboard — restores full formatting, colors, tags, and difficulty', icon: '📋', execute: () => App.commandPalette.pasteMcqs() },
                        { id: 'convertMcq', title: 'Convert to MCQ', desc: 'Convert selected text to an MCQ block', icon: '🪄', selection: true, execute: () => App.commandPalette.convertSelectionToMcq(), isPremium: true },
                        { id: 'toc', title: 'Insert Table of Contents', desc: 'Generates a smart, hierarchical TOC at the top of the article', icon: '📋', execute: () => App.commandPalette.insertTableOfContents() },
                        { id: 'clearFormatting', title: 'Clear Formatting', desc: 'Remove all custom styles from selected text', icon: '🧹', selection: true, execute: () => App.commandPalette.clearFormatting() },
                        { id: 'pdf', title: 'Import PDF', desc: 'Attach a PDF file to this note', icon: '📄', execute: () => App.pdf.triggerImport() },
                        { id: 'date', title: 'Insert Date', desc: 'Inserts today\'s date', icon: '📅', execute: () => document.execCommand('insertText', false, new Date().toLocaleDateString()) },
                        { id: 'time', title: 'Insert Time', desc: 'Inserts the current time', icon: '🕒', execute: () => document.execCommand('insertText', false, new Date().toLocaleTimeString()) },
                        { id: 'now', title: 'Insert Timestamp', desc: 'Inserts full date and time', icon: '🕰️', execute: () => document.execCommand('insertText', false, new Date().toLocaleString()) },
                        { id: 'h1', title: 'Heading 1', desc: 'Large section heading', icon: 'H1', execute: () => document.execCommand('formatBlock', false, 'H1') },
                        { id: 'h2', title: 'Heading 2', desc: 'Medium section heading', icon: 'H2', execute: () => document.execCommand('formatBlock', false, 'H2') },
                        { id: 'h3', title: 'Heading 3', desc: 'Small section heading', icon: 'H3', execute: () => document.execCommand('formatBlock', false, 'H3') },
                        { id: 'h4', title: 'Heading 4', desc: 'Extra small section heading', icon: 'H4', execute: () => document.execCommand('formatBlock', false, 'H4') },
                        { id: 'h5', title: 'Heading 5', desc: 'Tiny section heading', icon: 'H5', execute: () => document.execCommand('formatBlock', false, 'H5') },
                        { id: 'bulletList', title: 'Bulleted List', desc: 'Create a standard list', icon: '•', execute: () => document.execCommand('insertUnorderedList') },
                        { id: 'numberedList', title: 'Numbered List', desc: 'Create an ordered list', icon: '1.', execute: () => document.execCommand('insertOrderedList') },
                        { id: 'checkbox', title: 'Checkbox (To-do)', desc: 'Insert a trackable item', icon: '☑', execute: () => App.events.handleArticleControlsClick({ target: { closest: () => ({ dataset: { action: 'insertCheckbox' } }) } }), isPremium: true },
                        { id: 'bulletHyphen', title: 'Hyphen List', desc: 'A list with hyphen bullets', icon: '-', execute: () => App.events.handleArticleControlsClick({ target: { closest: () => ({ dataset: { action: 'applyListStyle', value: 'bullet-hyphen' } }) } }) },
                        { id: 'bulletCircle', title: 'Circle List', desc: 'A list with hollow circle bullets', icon: '○', execute: () => App.events.handleArticleControlsClick({ target: { closest: () => ({ dataset: { action: 'applyListStyle', value: 'bullet-empty-circle' } }) } }) },
                        { id: 'blockquote', title: 'Blockquote', desc: 'Visually offset text', icon: '”', execute: () => document.execCommand('formatBlock', false, 'blockquote') },
                        { id: 'code', title: 'Code Block', desc: 'Insert a pre-formatted block', icon: '&lt;/>', execute: () => document.execCommand('formatBlock', false, 'pre'), isPremium: true },
                        { id: 'accordion', title: 'Accordion Card', desc: 'Collapsible content for Q&A', icon: '🗂️', execute: () => App.events.insertAccordionCard(), isPremium: true },
                        { id: 'hr', title: 'Horizontal Rule', desc: 'Insert a dividing line', icon: '—', execute: () => document.execCommand('insertHorizontalRule') },
                        // NEW: Stat commands re-introduced
                        { id: 'words', title: 'Word Count', desc: 'Count words in selection or document', icon: '🧮', selection: true, execute: () => App.commandPalette.insertStatBadge('words'), isPremium: true },
                        { id: 'reading-time', title: 'Reading Time', desc: 'Estimate reading time for selection/doc', icon: '⏱️', selection: true, execute: () => App.commandPalette.insertStatBadge('time'), isPremium: true },
                        // --- Text Formatting ---
                        { id: 'bold', title: 'Bold', desc: 'Bold the selected text', icon: 'B', execute: () => document.execCommand('bold') },
                        { id: 'italic', title: 'Italic', desc: 'Italicize the selected text', icon: 'I', execute: () => document.execCommand('italic') },
                        { id: 'underline', title: 'Underline', desc: 'Underline the selected text', icon: 'U', execute: () => document.execCommand('underline') },
                        { id: 'normalize', title: 'Normalize Fonts', desc: 'Fix font sizes & remove styling issues', icon: '🧹', execute: () => App.commandPalette.normalizeFonts() },

                        { id: 'cloze', title: 'Create Cloze', desc: 'Make a flashcard from selection', icon: '...', selection: true, execute: () => App.events.applyFormatting('cloze') },
                        { id: 'tag', title: 'Create Tag', desc: 'Make a visual tag from selection', icon: '#', selection: true, execute: () => App.contentTools.tagSelection() },
                        { id: 'save', title: 'Save Article', desc: 'Save changes and continue writing', icon: '💾', execute: () => App.events.saveArticle() },
                        { id: 'read', title: 'Save & Read', desc: 'Save changes and switch to read mode', icon: '📖', execute: () => App.events.saveArticle({ switchToRead: true }) },
                        { id: 'done', title: 'Done', desc: 'Save changes and return to library', icon: '👍', execute: () => { App.events.saveArticle(); App.router.navigateTo('library'); } },
                        { id: 'focus', title: 'Toggle Focus Mode', desc: 'Enter distraction-free writing', icon: '✏️', execute: () => App.events.toggleFocusMode() },
                        // --- Font Size/Family ---
                        { id: 'fontsize', title: 'Set Font Size', desc: 'e.g., fontsize 24, fontsize large', icon: 'Aa' },
                        { id: 'fontfamily', title: 'Set Font Family', desc: 'e.g., fontfamily serif', icon: 'Ab' },
                        //--- AI Tools ---
                        { id: 'aimagic', title: 'Open AI Magic', desc: 'Access the AI Co-Pilot modal for quick commands', icon: '💎', execute: () => App.ui.aiMagicModal.open() },
                        { id: 'kashsummary', title: 'Kash Summary', desc: 'Generate an AI summary of the current note', icon: '✨', execute: () => App.events.ai.executeKashSummary(), isPremium: true },
                        { id: 'kashflash', title: 'Kash Flash', desc: 'Generate cloze flashcards from selected text', icon: '📇', selection: true, execute: () => App.events.ai.executeKashFlash() },
                        { id: 'kashwriting', title: 'Kash Writing', desc: 'Improve the writing of the selected text', icon: '✍️', selection: true, execute: () => App.events.ai.executeImproveWriting(), isPremium: true },
                        { id: 'kashgrammar', title: 'Kash Grammar', desc: 'Fix grammar and spelling for selected text', icon: '🧐', selection: true, execute: () => App.events.ai.executeFixGrammar(), isPremium: true },
                        { id: 'kashhighlight', title: 'Kash Highlight', desc: 'Automatically highlight key parts of the article', icon: '🎨', execute: () => App.events.ai.executeKashHighlight(), isPremium: true },
                        { id: 'kashcurate', title: 'Kash Curate', desc: 'Let AI beautify and structure your note', icon: '🪄', execute: () => App.events.ai.executeKashCurate(), isPremium: true },
                        { id: 'kashpresent', title: 'Kash Present', desc: 'Turn note into a beautiful presentation script', icon: '🎙️', execute: () => App.events.ai.executeKashPresent(), isPremium: true },
                        { id: 'kashask', title: 'KashAsk', desc: 'e.g., kashask What is mitochondria?', icon: '❓', isPremium: true },
                        { id: 'kashkeywords', title: 'KashKeywords', desc: 'Extract key concepts into a Decktile', icon: '🔑', execute: () => App.events.ai.executeKashKeywords(), isPremium: true },
                        { id: 'kashcomedy', title: 'KashComedy', desc: 'Generate a stand-up routine from the article', icon: '😂', execute: () => App.events.ai.executeKashComedy(), isPremium: true },
                        { id: 'kashstory', title: 'KashStory', desc: 'Generate a memorable story from the article', icon: '📖', execute: () => App.events.ai.executeKashStory(), isPremium: true },
                        { id: 'kashscript', title: 'KashScript', desc: 'Generate a short video script from the article', icon: '🎬', execute: () => App.events.ai.executeKashScript(), isPremium: true },
                        { id: 'kashmnemonic', title: 'KashMnemonic', desc: 'Create mnemonics from selected text', icon: '🧠', selection: true, execute: () => App.events.ai.executeKashMnemonic(), isPremium: true },
                        { id: 'kashexplain', title: 'KashExplain', desc: 'Generate a clear explanation of selected text', icon: '💡', selection: true, execute: () => App.events.ai.executeKashExplain(), isPremium: true },
                        { id: 'kashtranslate', title: 'KashTranslate', desc: 'e.g., kashtranslate Spanish', icon: '🌐', selection: true, isPremium: true },
                        { id: 'kashtags', title: 'KashTags', desc: 'Automatically generate and apply tags to the article', icon: '🏷️', execute: () => App.events.ai.executeKashTags(), isPremium: true },
                        { id: 'kashaccordion', title: 'KashAccordion', desc: 'Generate Q&A accordions from the article', icon: '❓', execute: () => App.events.ai.executeKashAccordion(), isPremium: true },
                        { id: 'template', title: 'Insert Template', desc: 'Open the Template Hub to browse and add a Template', icon: '📄', execute: () => App.ui.showTemplateHubModal() },
                        { id: 'kashcraft', title: 'KashCraft Article Analysis', desc: 'Transform the note into a structured craft for exam', icon: '⛳️', execute: () => App.events.ai.executeKashCraft(), isPremium: true },
                        { id: 'kashquestion', title: 'Kash Question', desc: 'Generate 5 key questions from the article', icon: '❓', execute: () => App.events.ai.executeKashQuestion(), isPremium: true },
                        { id: 'kashdebate', title: 'Kash Debate', desc: 'Create a debate table from the article content', icon: '⚖️', execute: () => App.events.ai.executeKashDebate(), isPremium: true },
                        { id: 'kashlong', title: 'Kash Long', desc: 'Generate a detailed summary of the article', icon: '📜', execute: () => App.events.ai.executeKashLong(), isPremium: true },
                        { id: 'kashtable', title: 'Kash Table', desc: 'Create a revision table from selected text', icon: '▦', selection: true, execute: () => App.events.ai.executeKashTable(), isPremium: true },
                        { id: 'kashmcq', title: 'KashMCQ Generator', desc: 'Generate MCQs from the article content', icon: '🧠', execute: () => App.events.ai.executeKashMcqGenerator(), isPremium: true },
                        { id: 'kashmcqreviser', title: 'KashMCQ Reviser', desc: 'Revise & Colorize selected MCQs', icon: '🎨', selection: true, execute: () => App.events.ai.executeKashMcqReviser(), isPremium: true },
                        { id: 'kashlist', title: 'Kash List', desc: 'Convert selected text to a Bulleted list', icon: '📋', selection: true, execute: () => App.events.ai.executeKashListify(), isPremium: true },
                        { id: 'kashtimeline', title: 'Kash Timeline', desc: 'Convert article content into a Timeline', icon: '⏳', execute: () => App.events.ai.executeKashTimeline(), isPremium: true },
                        { id: 'kashoutline', title: 'Kash Outline', desc: 'e.g., kashoutline The Greek Empire', icon: '📜', execute: () => { /* Handled by filter logic */ }, isPremium: true },
                        { id: 'kashexpand', title: 'Kash Expand', desc: 'Continue writing from your cursor', icon: '✍️', selection: false, execute: () => App.events.ai.executeKashExpand(), isPremium: true },
                        { id: 'kashquote', title: 'Kash Quote', desc: 'Find a contextually relevant quote for your article', icon: '❝', selection: false, execute: () => App.events.ai.executeKashQuote(), isPremium: true },
                        { id: 'kashextract', title: 'Kash Extract', desc: 'e.g., kashextract key arguments', icon: '🔍', execute: () => { /* Handled by filter logic */ }, isPremium: true },
                        { id: 'kashlink', title: 'Kash Link', desc: 'e.g., kashlink The Indus Valley Civilization', icon: '🔗', execute: () => { /* Handled by filter logic */ }, isPremium: true },
                        { id: 'kashsplit', title: 'KashSplit', desc: 'Intelligently split the current note into two', icon: '✂️', execute: () => App.events.ai.executeKashSplit(), isPremium: true },
                        { id: 'kashmindmap', title: 'Kash Mindmap', desc: 'Scan article and generate a mindmap hierarchy', icon: '🕸️', selection: false, execute: () => App.events.ai.executeKashMindmap(), isPremium: true },
                        { id: 'web', title: 'Insert Web Link', desc: 'e.g., web https://...', icon: '🌐', execute: () => { App.commandPalette.els.input.value = 'web '; App.commandPalette.filter(); } },
                    ];
                    // 🚀 SMART DYNAMIC DATA GENERATORS - Replaces 400+ lines of hardcoded data!
                    this.state.emojiData = this._generateEmojiData();
                    this.state.iconData = this._generateIconData();

                    this.state.fuse.commands = App.offline.safeFuse(this.state.commands, { keys: ['title', 'desc', 'id'], threshold: 0.3 });
                    this.state.fuse.categories = null;
                    this.state.fuse.emojis = App.offline.safeFuse(this.state.emojiData, { keys: ['k'], threshold: 0.4 });
                    this.state.fuse.icons = App.offline.safeFuse(this.state.iconData, { keys: ['k', 'icon'], threshold: 0.4 });

                    this.state.fuse.fontFamilies = App.offline.safeFuse(this.state.fontFamilyOptions, { keys: ['name'], threshold: 0.3 });
                    this.state.fuse.fontSizes = App.offline.safeFuse(this.state.fontSizeOptions, { threshold: 0.3 });

                    this.els.input.addEventListener('input', () => this.filter());
                    this.els.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
                },

                async toggleCollapse() {
                    this._restoreEditor();
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;

                    let range = selection.getRangeAt(0);
                    let node = range.startContainer;
                    if (node.nodeType === 3) node = node.parentNode;

                    // Helper function to create collapsible icon
                    const createCollapsibleIcon = () => {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'collapsible-icon';
                        iconSpan.setAttribute('data-collapsible-icon', 'true');
                        iconSpan.contentEditable = 'false'; // Icon should not be editable
                        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
                        return iconSpan;
                    };

                    // Helper function to add icon to heading if not present
                    const ensureIconPresent = (heading) => {
                        if (!heading.querySelector('[data-collapsible-icon]')) {
                            const icon = createCollapsibleIcon();
                            heading.insertBefore(icon, heading.firstChild);
                        }
                    };

                    // Helper function to remove icon from heading
                    const removeIcon = (heading) => {
                        const icon = heading.querySelector('[data-collapsible-icon]');
                        if (icon) icon.remove();
                    };

                    // Find block element
                    let block = node;
                    while (block && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(block.tagName)) {
                        block = block.parentElement;
                        if (!block || block.id === 'article-content') break;
                    }

                    if (!block || block.id === 'article-content' || block.classList.contains('nk-text-tile') || block.closest('.nk-text-tile')) {
                        // Create new H3 as default collapsible if nothing or tile selected
                        const h3 = document.createElement('h3');
                        h3.className = 'collapsible-heading';
                        const icon = createCollapsibleIcon();
                        h3.appendChild(icon);
                        h3.innerHTML += '<br>'; // Keep empty for immediate typing
                        document.execCommand('insertHTML', false, h3.outerHTML + '<p><br></p>');
                        return;
                    }

                    // Case: It's a header -> Toggle the class
                    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(block.tagName)) {
                        block.classList.toggle('collapsible-heading');

                        if (block.classList.contains('collapsible-heading')) {
                            // Adding collapsible feature - add icon
                            ensureIconPresent(block);
                        } else {
                            // Removing collapsible feature - remove icon and expand all
                            removeIcon(block);
                            block.removeAttribute('data-collapsed');

                            // Un-hide everything under it (Robustness Fix)
                            let next = block.nextElementSibling;
                            const level = parseInt(block.tagName.substring(1));
                            while (next) {
                                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(next.tagName)) {
                                    const nextLevel = parseInt(next.tagName.substring(1));
                                    if (nextLevel <= level) break;
                                }
                                next.classList.remove('collapsible-hidden');
                                next = next.nextElementSibling;
                            }
                        }
                    } else {
                        // Case: It's text/p -> Convert to H3 Collapsible
                        const h3 = document.createElement('h3');
                        h3.className = 'collapsible-heading';
                        const icon = createCollapsibleIcon();
                        h3.appendChild(icon);

                        // Preserve the block's content
                        const content = block.innerHTML.trim();
                        if (content && content !== '<br>') {
                            h3.innerHTML += block.innerHTML;
                        } else {
                            h3.innerHTML += '<br>';
                        }

                        block.replaceWith(h3);
                        // Add a generic P after if current block was empty-ish to allow typing
                        if (!h3.textContent.trim()) {
                            h3.insertAdjacentHTML('afterend', '<p><br></p>');
                        }
                    }
                    App.state.isArticleDirty = true;
                },

                copyAllContents() {
                    const articleContent = document.getElementById('article-content');
                    if (!articleContent) {
                        App.ui.showToast('Nothing to copy.', { type: 'warning' });
                        return;
                    }

                    try {
                        const html = articleContent.innerHTML;
                        const text = articleContent.innerText;

                        const clipboardItem = new ClipboardItem({
                            "text/html": new Blob([html], { type: "text/html" }),
                            "text/plain": new Blob([text], { type: "text/plain" })
                        });

                        navigator.clipboard.write([clipboardItem]).then(() => {
                            App.ui.showToast('Copied full note to clipboard!', { type: 'success' });
                        }).catch(err => {
                            console.error('Clipboard write failed:', err);
                            navigator.clipboard.writeText(text);
                            App.ui.showToast('Copied note to clipboard (text only)!', { type: 'success' });
                        });
                    } catch (err) {
                        console.error('Copy All failed:', err);
                        navigator.clipboard.writeText(articleContent ? articleContent.innerText : '');
                        App.ui.showToast('Copied note to clipboard (text only)!', { type: 'success' });
                    }
                },

                async pasteFast() {
                    try {
                        const clipboardItems = await navigator.clipboard.read();
                        const htmlItem = clipboardItems.find(item => item.types.includes('text/html'));

                        let contentToInsert = '';

                        if (htmlItem) {
                            const htmlBlob = await htmlItem.getType('text/html');
                            const pastedHTML = await htmlBlob.text();

                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = pastedHTML;

                            const cleanBackgroundStyles = (element) => {
                                if (element.style && (element.style.backgroundColor || element.style.background)) {
                                    element.style.removeProperty('background-color');
                                    element.style.removeProperty('background'); // Also remove the shorthand property
                                }
                                if (element.hasAttribute('bgcolor')) {
                                    element.removeAttribute('bgcolor');
                                }
                                for (const child of element.children) {
                                    cleanBackgroundStyles(child);
                                }
                            };

                            cleanBackgroundStyles(tempDiv);
                            contentToInsert = tempDiv.innerHTML;

                        } else {
                            const text = await navigator.clipboard.readText();
                            if (text) {
                                contentToInsert = App.util.textToHtml(text);
                            }
                        }

                        if (contentToInsert) {
                            document.execCommand('insertHTML', false, contentToInsert);
                            App.state.isArticleDirty = true;
                            App.ui.showToast('Pasted quickly!', { type: 'success' });
                        } else {
                            App.ui.showToast('Nothing to paste from clipboard.', { type: 'warning' });
                        }

                    } catch (err) {
                        console.error('Quick Paste failed:', err);
                        if (err.name === 'NotAllowedError') {
                            App.ui.showToast('Clipboard access denied. Please allow it in your browser settings.', { type: 'error' });
                        } else {
                            App.ui.showToast('Could not paste content.', { type: 'error' });
                        }
                    }
                },

                async importOneNote() {
                    try {
                        const clipboardItems = await navigator.clipboard.read();
                        const htmlItem = clipboardItems.find(item => item.types.includes('text/html'));

                        if (!htmlItem) {
                            const text = await navigator.clipboard.readText();
                            if (text) {
                                document.execCommand('insertHTML', false, App.util.textToHtml(text));
                                App.ui.showToast('Imported as text (No HTML found).', { type: 'info' });
                            } else {
                                App.ui.showToast('Clipboard is empty.', { type: 'warning' });
                            }
                            return;
                        }

                        // 1. Launch Popup
                        App.ui.migrationScreen.show("Importing OneNote");
                        App.ui.migrationScreen.update(10, "Reading clipboard...");

                        const blob = await htmlItem.getType('text/html');
                        const rawHtml = await blob.text();

                        // Yield to UI thread to let popup render
                        setTimeout(() => {
                            try {
                                if (App.ui.migrationScreen.state.isCancelled) { App.ui.migrationScreen.hide(); return; }

                                App.ui.migrationScreen.update(40, "Cleaning Microsoft formatting...");

                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = rawHtml;

                                // --- THE CLEANING PROTOCOL ---
                                tempDiv.querySelectorAll('style, script, link, meta, xml, o\\:p').forEach(el => el.remove());

                                const allElements = tempDiv.querySelectorAll('*');

                                // Reused helper from previous turn
                                const isDarkColor = (colorString) => {
                                    if (!colorString) return false;
                                    const c = colorString.replace(/\s/g, '').toLowerCase();
                                    return (c === 'black' || c === '#000000' || c === '#000' || c === 'rgb(0,0,0)' || c === '#201f1e' || c === '#333333' || c === 'windowtext');
                                };

                                allElements.forEach(el => {
                                    el.style.removeProperty('width');
                                    el.style.removeProperty('min-width');
                                    el.style.removeProperty('max-width');
                                    el.style.removeProperty('height');
                                    el.style.removeProperty('position');
                                    el.style.removeProperty('left');
                                    el.style.removeProperty('top');
                                    el.style.removeProperty('margin-left');
                                    el.removeAttribute('width');
                                    el.removeAttribute('height');
                                    el.removeAttribute('lang');
                                    el.classList.remove('ExternalClass');

                                    if (el.style.color && isDarkColor(el.style.color)) {
                                        el.style.removeProperty('color');
                                    }
                                    if (el.style.backgroundColor) {
                                        const bg = el.style.backgroundColor.replace(/\s/g, '').toLowerCase();
                                        if (bg === 'white' || bg === '#ffffff' || bg === '#fff' || bg === 'transparent') {
                                            el.style.removeProperty('background-color');
                                        }
                                    }
                                });

                                const tables = tempDiv.querySelectorAll('table');
                                tables.forEach(table => {
                                    table.style.width = '100%';
                                    table.style.borderCollapse = 'collapse';
                                    table.removeAttribute('border');
                                    table.removeAttribute('cellpadding');
                                    table.removeAttribute('cellspacing');
                                    table.style.marginBottom = '1em';
                                });

                                const spans = tempDiv.querySelectorAll('span');
                                spans.forEach(span => {
                                    if (span.style.fontFamily) span.style.removeProperty('font-family');
                                    if (span.style.fontSize) span.style.removeProperty('font-size');
                                    if (!span.hasAttribute('style') && !span.hasAttribute('class') && !span.hasAttribute('id')) {
                                        App.util.unwrapNode(span);
                                    }
                                });

                                const images = tempDiv.querySelectorAll('img');
                                images.forEach(img => {
                                    if (img.src.startsWith('file://')) {
                                        const placeholder = document.createElement('span');
                                        placeholder.innerText = '[Image skipped: Local File]';
                                        placeholder.style.color = 'var(--text-secondary)';
                                        placeholder.style.fontSize = '0.8em';
                                        img.parentNode.replaceChild(placeholder, img);
                                    } else {
                                        img.style.maxWidth = '100%';
                                        img.style.height = 'auto';
                                        img.removeAttribute('width');
                                        img.removeAttribute('height');
                                    }
                                });

                                // 4. Finalize
                                App.ui.migrationScreen.update(90, "Inserting content...");
                                const cleanHtml = tempDiv.innerHTML.trim();

                                if (cleanHtml) {
                                    document.execCommand('insertHTML', false, cleanHtml);
                                    document.execCommand('insertHTML', false, '<p><br></p>');
                                    App.state.isArticleDirty = true;

                                    App.ui.migrationScreen.update(100, "Done!");
                                    setTimeout(() => {
                                        App.ui.migrationScreen.hide();
                                        App.ui.showToast('OneNote content sanitized!', { type: 'success' });
                                    }, 200);
                                } else {
                                    App.ui.migrationScreen.hide();
                                    App.ui.showToast('Could not parse content.', { type: 'error' });
                                }

                            } catch (innerErr) {
                                console.error("OneNote Processing Error:", innerErr);
                                App.ui.migrationScreen.hide();
                                App.ui.showToast('Import failed during processing.', { type: 'error' });
                            }
                        }, 50);

                    } catch (err) {
                        console.error("OneNote Access Error:", err);
                        if (App.ui.migrationScreen) App.ui.migrationScreen.hide();
                        if (err.name === 'NotAllowedError') {
                            App.ui.showToast('Clipboard permission denied.', { type: 'error' });
                        } else {
                            App.ui.showToast('Import failed.', { type: 'error' });
                        }
                    }
                },

                async fetchDefinition(word) {
                    try {
                        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                        if (!response.ok) { return [{ type: 'definition', error: `No definition found for "${word}".` }]; }
                        const data = await response.json();
                        const results = data.flatMap(entry => entry.meanings.map(meaning => {
                            const definition = meaning.definitions[0];
                            return definition ? {
                                type: 'definition', word: entry.word, partOfSpeech: meaning.partOfSpeech,
                                definition: definition.definition, example: definition.example,
                                synonyms: (meaning.synonyms || []).join(', ')
                            } : null;
                        })).filter(Boolean);
                        return results.length > 0 ? results : [{ type: 'definition', error: `No definition found for "${word}".` }];
                    } catch (error) {
                        console.error("Dictionary API error:", error);
                        return [{ type: 'definition', error: "Could not connect to the dictionary service." }];
                    } finally {
                        this.state.isFetching = false;
                    }
                },
                normalizeFonts() {
                    const contentDiv = document.getElementById('article-content');
                    if (!contentDiv) return;

                    this._saveEditorState();

                    const elements = contentDiv.querySelectorAll('[style]');
                    let cleanCount = 0;

                    elements.forEach(el => {
                        if (el.style.fontFamily) { el.style.removeProperty('font-family'); cleanCount++; }
                        if (el.style.fontSize) { el.style.removeProperty('font-size'); cleanCount++; }
                        if (el.style.lineHeight) { el.style.removeProperty('line-height'); cleanCount++; }
                        if (el.style.backgroundColor) { el.style.removeProperty('background-color'); }

                        if (el.getAttribute('style') === '') {
                            el.removeAttribute('style');
                        }
                        if (el.tagName === 'SPAN' && !el.hasAttribute('class') && !el.hasAttribute('style') && !el.hasAttribute('id')) {
                            App.util.unwrapNode(el);
                        }
                    });

                    App.state.isArticleDirty = true;
                    App.ui.showToast(`Normalized fonts on ${cleanCount} elements!`, 'success');
                },

                // FIX: Highlighting logic now uses the stored targetBlockElement
                applyBlockHighlight(className) {
                    const blockElement = this.state.targetBlockElement;
                    if (!blockElement) {
                        App.ui.showToast("Can only highlight full text blocks.", { type: 'warning' });
                        return;
                    }
                    blockElement.classList.remove(...this.state.highlightOptions.map(h => h.className).filter(Boolean));
                    if (className) {
                        blockElement.classList.add(className);
                    }
                    App.state.isArticleDirty = true;
                },

                _saveEditorState() {
                    const contentDiv = document.getElementById('article-content');
                    if (contentDiv && !this.state.isPreviewActive) {
                        if (App.state.autosaveInterval) { clearInterval(App.state.autosaveInterval); App.state.autosaveInterval = null; }
                        this.state.originalContentState = { articleId: App.state.activeArticleId, html: contentDiv.innerHTML, isDirty: App.state.isArticleDirty, scrollTop: document.querySelector('main').scrollTop };
                        this.state.isPreviewActive = true;
                        contentDiv.contentEditable = false;
                    }
                },
                _restoreEditor() {
                    if (this.state.isPreviewActive && this.state.originalContentState) {
                        const originalState = this.state.originalContentState;
                        App.router.navigateTo('article', { id: originalState.articleId, mode: 'write', overrideContent: originalState.html, restoredScrollTop: originalState.scrollTop });
                        App.state.isArticleDirty = originalState.isDirty;
                    }
                    this.state.isPreviewActive = false;
                    this.state.originalContentState = null;
                    clearTimeout(this.state.previewTimeout);
                },
                async _renderPreview(item) {
                    // 1. Clear any existing preview pane locally
                    const existingPane = this.els.palette.querySelector('.nk-command-palette-preview');
                    if (existingPane) existingPane.remove();

                    if (!item) return;

                    const isLinkPreview = item.type === 'article' || item.type === 'snippet' || item.type === 'tag';

                    if (isLinkPreview) {
                        try {
                            const targetId = item.type === 'article' ? item.id : item.articleId;

                            // Check internally
                            const targetArticle = App.state.articles.find(a => a.id === targetId);
                            if (!targetArticle) return; // Silent fail

                            // Prepare Content Variables
                            let badge = '📄 Article';
                            let headerText = item.title; // Default: Header is the item title
                            let bodyText = item.desc; // Default: Body is the content
                            let isSnippetView = false;

                            if (item.type === 'snippet') {
                                badge = '💬 Snippet';
                                isSnippetView = true;

                                // REQ #1-a: Bubble should have Article Title (header) and Complete Snippet (Body)
                                headerText = targetArticle ? targetArticle.title : 'Unknown Article';
                                bodyText = item.title; // Fuse stores the Snippet Text in 'title'

                            } else if (item.type === 'tag') {
                                badge = '🏷️ Tag';

                                // REQ #1-c: Title and Tag Extracted Paragraph
                                headerText = `#${item.title}`;
                                bodyText = 'Tag context not found.';

                                if (targetArticle && targetArticle.content) {
                                    // Try to find the tag in the content
                                    const tagRegex = new RegExp(`#${App.util.escapeRegex(item.title)}\\b`, 'i');
                                    const match = targetArticle.content.match(tagRegex);
                                    if (match) {
                                        // Extract surrounding text (approx 150 chars)
                                        const start = Math.max(0, match.index - 50);
                                        const end = Math.min(targetArticle.content.length, match.index + 100);
                                        // Strip HTML for clean preview
                                        const temp = document.createElement('div');
                                        temp.innerHTML = targetArticle.content.substring(start, end);
                                        bodyText = '...' + temp.textContent.trim() + '...';
                                    } else {
                                        // Use first paragraph if tag specific location fail
                                        const temp = document.createElement('div');
                                        temp.innerHTML = targetArticle.content;
                                        bodyText = temp.textContent.substring(0, 150) + '...';
                                    }
                                }


                            } else {
                                // Standard Article
                                // REQ #1-b: Title and Sample
                                headerText = item.title;
                                if (targetArticle.content) {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = targetArticle.content;
                                    bodyText = temp.textContent || '';
                                } else {
                                    bodyText = item.desc || 'No preview content available.';
                                }
                            }

                            // Truncate Body if MASSIVE
                            if (bodyText.length > 400) bodyText = bodyText.substring(0, 400) + '...';

                            // Render Side Pane
                            const pane = document.createElement('div');
                            pane.className = 'nk-command-palette-preview';
                            pane.innerHTML = `
                                <div class="nk-preview-header">
                                    <span class="nk-preview-badge">${badge}</span>
                                    <span style="font-size:0.9rem; opacity:0.7;">${(item.type === 'article' || item.type === 'snippet') ? '📄' : '🏷️'}</span>
                                </div>
                                <h4 class="nk-preview-title" style="font-size: 0.95rem; opacity: 0.9; margin-bottom:4px;">${App.util.escapeHtml(headerText)}</h4>
                                <div class="nk-preview-content ${isSnippetView ? 'is-snippet' : ''}">${App.util.escapeHtml(bodyText)}</div>
                            `;

                            this.els.palette.appendChild(pane);

                            // Slight delay for specific animation
                            requestAnimationFrame(() => {
                                pane.classList.add('visible');
                            });

                        } catch (e) {
                            console.error("In-place preview failed:", e);
                        }
                    }
                },
                _updateSelection() {
                    clearTimeout(this.state.previewTimeout);
                    this._restoreEditor();

                    // Support both list items (.command-item) and grid items (.emoji-grid-item)
                    const items = this.els.list.querySelectorAll('.command-item, .emoji-grid-item');
                    items.forEach((item, index) => {
                        item.classList.toggle('selected', index === this.state.selectedIndex);
                        if (index === this.state.selectedIndex) {
                            item.scrollIntoView({ block: 'nearest' });
                            this.state.previewTimeout = setTimeout(() => { this._renderPreview(this.state.filteredResults[this.state.selectedIndex]); }, 150);
                        }
                    });
                },
                _repositionPaletteIfObscuring(targetElement) {
                    if (!targetElement) return;
                    const targetRect = targetElement.getBoundingClientRect();
                    const paletteRect = this.els.palette.getBoundingClientRect();
                    if (paletteRect.bottom > targetRect.top && paletteRect.top < targetRect.bottom) {
                        this.els.palette.style.top = '15px'; this.els.palette.style.left = '50%'; this.els.palette.style.transform = 'translateX(-50%)';
                    }
                },

                open(range = null) {
                    if (this.state.isOpen) return;

                    if (range && !range.collapsed) {
                        App.state.savedRange = range.cloneRange();
                        this.state.cursorMarkerId = null;
                    } else if (range) {
                        const markerId = `nk-cursor-marker-${Date.now()}`;
                        const markerNode = document.createElement('span');
                        markerNode.id = markerId;
                        range.insertNode(markerNode);
                        this.state.cursorMarkerId = markerId;
                        App.state.savedRange = null;
                    } else {
                        this.state.cursorMarkerId = null;
                        App.state.savedRange = null;
                    }

                    this.state.isOpen = true;
                    document.addEventListener('click', this.handleClickOutside, true);

                    this.state.targetBlockElement = range ? (range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer).closest('p, li, h1, h2, h3, h4, h5, h6, blockquote') : null;

                    // --- START: MODIFIED POSITIONING LOGIC ---
                    const isMobileView = document.body.classList.contains('mobile-view');

                    if (isMobileView) {
                        // On mobile, always position at the top.
                        this.els.palette.style.left = '50%';
                        this.els.palette.style.top = '55px'; // Just below the header
                        this.els.palette.style.transform = 'translateX(-50%)';
                    } else if (this.state.cursorMarkerId) {
                        // Original desktop logic for cursor position
                        const markerNode = document.getElementById(this.state.cursorMarkerId);
                        const rect = markerNode.getBoundingClientRect();
                        const paletteWidth = 380, paletteHeight = 400, margin = 10;
                        let top = rect.bottom + window.scrollY + 5;
                        let left = rect.left + window.scrollX;
                        if (rect.bottom + paletteHeight > window.innerHeight) { top = rect.top + window.scrollY - paletteHeight - 5; }
                        if (left + paletteWidth > window.innerWidth) { left = window.innerWidth - paletteWidth - margin; }
                        this.els.palette.style.top = `${Math.max(margin, top)}px`;
                        this.els.palette.style.left = `${Math.max(margin, left)}px`;
                        this.els.palette.style.transform = '';
                    } else {
                        // Original desktop logic for broad selection or header click
                        this.els.palette.style.left = '50%';
                        this.els.palette.style.top = '20vh';
                        this.els.palette.style.transform = 'translateX(-50%)';
                    }
                    // --- END: MODIFIED POSITIONING LOGIC ---

                    this.els.palette.style.display = 'flex';
                    this.els.input.focus();
                    this.filter();
                },

                insertTimeline() {
                    const timelineHTML = `<div class="nk-timeline-block" contenteditable="false"><div class="nk-timeline-entry"><div class="nk-timeline-content"><div class="nk-timeline-date" contenteditable="true">2024-01-01</div><div class="nk-timeline-title" contenteditable="true">First event...</div></div></div><div class="nk-timeline-entry"><div class="nk-timeline-content"><div class="nk-timeline-date" contenteditable="true">2025-03-15</div><div class="nk-timeline-title" contenteditable="true">Second event...</div></div></div><div class="nk-timeline-add" contenteditable="false"><button title="Add Timeline Entry" type="button">+</button></div></div><p><br></p>`;
                    App.util.insertGuardianBlock(timelineHTML);
                },
                // NEW: Function to insert stat badges
                insertStatBadge(type) {
                    const sel = window.getSelection();
                    let text = '';
                    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                        text = sel.toString();
                    } else {
                        const contentDiv = document.getElementById('article-content');
                        if (contentDiv) {
                            text = contentDiv.innerText || contentDiv.textContent;
                        }
                    }
                    if (!text.trim()) {
                        App.ui.showToast('No text found to analyze.', { type: 'warning' });
                        return;
                    }
                    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
                    let badgeHTML = '';

                    // FIX: Replaced complex SVG with simple, reliable Font Awesome icons
                    if (type === 'words') {
                        const icon = `<i class="fa-solid fa-pen-ruler"></i>`;
                        badgeHTML = `<span class="nk-stat-badge" contenteditable="false">${icon} ${wordCount} words</span>`;
                    } else if (type === 'time') {
                        const icon = `<i class="fa-regular fa-clock"></i>`;
                        const minutes = Math.ceil(wordCount / 200);
                        const timeText = minutes < 1 ? '< 1 min read' : `${minutes} min read`;
                        badgeHTML = `<span class="nk-stat-badge" contenteditable="false">${icon} ${timeText}</span>`;
                    }

                    if (badgeHTML) {
                        document.execCommand('insertHTML', false, badgeHTML + '&nbsp;');
                    }
                },

                insertTableOfContents(options = {}) {
                    const editor = document.getElementById('article-content');
                    if (!editor) {
                        App.ui.showToast('Please open an article to generate Table of Contents.', { type: 'warning' });
                        return;
                    }

                    // Find all main headings in the article content editor
                    const rawHeadings = Array.from(editor.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                    
                    // Filter out headings that are inside elements with contenteditable="false" (e.g. TOC itself)
                    const headings = rawHeadings.filter(h => {
                        const parentFalse = h.closest('[contenteditable="false"]');
                        return !parentFalse && h.textContent.trim().length > 0;
                    });

                    if (headings.length === 0) {
                        App.ui.showToast('No headings found in the article to build a Table of Contents.', { type: 'info' });
                        if (options.refreshOnly) {
                            // If user clicked refresh on an empty doc, remove the TOC block
                            const existingToc = editor.querySelector('.nk-toc-block');
                            if (existingToc) existingToc.remove();
                        }
                        return;
                    }

                    // Ensure all headings have a unique ID for anchor navigation
                    headings.forEach((heading) => {
                        if (!heading.id) {
                            let slug = heading.textContent.trim().toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '');
                            if (!slug) slug = 'heading';
                            
                            let uniqueSlug = slug;
                            let counter = 1;
                            while (document.getElementById(uniqueSlug)) {
                                uniqueSlug = `${slug}-${counter++}`;
                            }
                            heading.id = uniqueSlug;
                        }
                    });

                    // Build TOC items HTML
                    const tocItemsHTML = headings.map(h => {
                        const levelClass = `nk-toc-${h.tagName.toLowerCase()}`;
                        return `<a href="#${h.id}" class="nk-toc-item ${levelClass}">${App.util.escapeHtml(h.textContent.trim())}</a>`;
                    }).join('');

                    // Construct full TOC component HTML
                    const tocHTML = `
                        <div class="nk-toc-block" contenteditable="true">
                            <div class="nk-toc-header">
                                <span class="nk-toc-title">Table of Contents</span>
                                <button class="nk-toc-refresh-btn" contenteditable="false" title="Refresh Table of Contents">↻</button>
                            </div>
                            <div class="nk-toc-list">
                                ${tocItemsHTML}
                            </div>
                        </div>
                    `;

                    // Check for existing TOC block to replace, or insert at top
                    const existingToc = editor.querySelector('.nk-toc-block');
                    if (existingToc) {
                        // Replace in-place
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = tocHTML.trim();
                        const newTocNode = tempDiv.firstChild;
                        existingToc.replaceWith(newTocNode);
                        App.ui.showToast('Table of Contents updated!', { type: 'success' });
                    } else if (!options.refreshOnly) {
                        // Insert at top of the article
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = tocHTML.trim();
                        const newTocNode = tempDiv.firstChild;
                        
                        // Insert before first child or append if empty
                        if (editor.firstChild) {
                            editor.insertBefore(newTocNode, editor.firstChild);
                        } else {
                            editor.appendChild(newTocNode);
                        }
                        
                        // Ensure we have a paragraph below the TOC so editing is easy
                        if (!newTocNode.nextSibling || newTocNode.nextSibling.nodeName !== 'P') {
                            const p = document.createElement('p');
                            p.innerHTML = '<br>';
                            newTocNode.after(p);
                        }
                        
                        App.ui.showToast('Table of Contents inserted!', { type: 'success' });
                    }

                    App.state.isArticleDirty = true;
                },

                insertMcqBlock() {
                    const mcqId = `mcq-${crypto.randomUUID()}`; // Unique ID to find the new element
                    const mcqHTML = `
                    <div id="${mcqId}" class="nk-mcq-block" contenteditable="false">
                        <div class="nk-mcq-toolbar">
                            <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                            <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <div class="nk-mcq-question" contenteditable="true" data-placeholder="Type your question here..."></div>
                        <div class="nk-mcq-options">
                            <div class="nk-mcq-option" data-is-correct="false">
                                <div class="nk-mcq-option-radio"></div>
                                <div class="nk-mcq-option-text" contenteditable="true" data-placeholder="Option A"></div>
                                <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                            </div>
                            <div class="nk-mcq-option" data-is-correct="false">
                                <div class="nk-mcq-option-radio"></div>
                                <div class="nk-mcq-option-text" contenteditable="true" data-placeholder="Option B"></div>
                                <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                            </div>
                        </div>
                        <button class="btn btn-secondary nk-mcq-add-option">+ Add Option</button>
                        
                        <div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Your Explanation ..."></div>
                    </div>`;
                    App.util.insertGuardianBlock(mcqHTML);

                    // UX ENHANCEMENT: Automatically focus the cursor in the new question area.
                    setTimeout(() => {
                        const newMcq = document.getElementById(mcqId);
                        if (newMcq) {
                            const questionEl = newMcq.querySelector('.nk-mcq-question');
                            if (questionEl) {
                                App.util.placeCursor(questionEl);
                            }
                        }
                    }, 50);

                    App.state.isArticleDirty = true;
                },


                insertTextileDeck() {
                    const deckHTML = `
                <div class="nk-textile-deck" contenteditable="false">
                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                    <div class="nk-text-tile color-stone" contenteditable="false" data-color="stone">
                        <span class="nk-text-tile-icon"></span>
                        <div class="nk-text-tile-color-cycler" title="Cycle Color"><i class="fa-solid fa-palette fa-xs"></i></div>
                        <div class="nk-text-tile-content" contenteditable="true" data-placeholder="First tile..."></div>
                    </div>
                    <div class="deck-add-tile-btn" title="Add another tile to this deck">+ Add Tile</div>
                </div>
                <p><br></p>`;
                    App.util.insertGuardianBlock(deckHTML);
                },

                convertListToDeck() {
                    const selection = window.getSelection();
                    if (!selection.rangeCount > 0) return;
                    const range = selection.getRangeAt(0);
                    const listNode = range.startContainer.parentElement.closest('ul, ol');

                    if (!listNode) {
                        App.ui.showToast("Place your cursor in a list to convert it.", { type: 'warning' });
                        return;
                    }

                    // --- FIX: Filter for solid colors only ---
                    const solidColors = this.state.textileColors.filter(c => !isNaN(c));
                    const listItems = listNode.querySelectorAll('li');
                    let tilesHTML = '';
                    listItems.forEach((item, index) => {
                        if (item.textContent.trim() === '') return;
                        // This now correctly cycles through only the 10 solid colors.
                        const color = solidColors[index % solidColors.length];
                        tilesHTML += `
                    <div class="nk-text-tile color-${color}" contenteditable="false" data-color="${color}">
                        <span class="nk-text-tile-icon"></span>
                        <div class="nk-text-tile-color-cycler" title="Cycle Color"><i class="fa-solid fa-palette fa-xs"></i></div>
                        <div class="nk-text-tile-content" contenteditable="true">${item.innerHTML}</div>
                    </div>`;
                    });

                    const deckHTML = `
                <div class="nk-textile-deck" contenteditable="false">
                    <div class="deck-layout-toggle" title="Toggle Layout"><i class="fa-solid fa-table-cells"></i></div>
                    ${tilesHTML}
                    <div class="deck-add-tile-btn" title="Add another tile to this deck">+ Add Tile</div>
                </div>`;

                    listNode.outerHTML = deckHTML;
                    App.state.isArticleDirty = true;
                    App.ui.showToast("List converted to Decktile!", { type: 'success' });
                },

                insertTextTile() {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;

                    // Capture selected text if any
                    const selectedText = selection.toString().trim();
                    const selectedHTML = selection.rangeCount > 0 ? (() => {
                        const range = selection.getRangeAt(0);
                        const container = document.createElement('div');
                        container.appendChild(range.cloneContents());
                        return container.innerHTML;
                    })() : '';

                    const solidColors = this.state.textileColors.filter(c => !isNaN(c));
                    const randomColor = solidColors[Math.floor(Math.random() * solidColors.length)];
                    const tileId = `tile-${crypto.randomUUID()}`;

                    // Include selected text/HTML in the textile if present
                    const textTileHTML = `
                    <div id="${tileId}" class="nk-text-tile color-${randomColor}" contenteditable="false" data-color="${randomColor}">
                        <div class="nk-text-tile-color-cycler" title="Cycle Color"><i class="fa-solid fa-palette fa-xs"></i></div>
                        <div class="nk-text-tile-content" contenteditable="true" data-placeholder="Type here...">${selectedHTML || ''}</div>
                    </div>
                    <p><br></p>`;

                    document.execCommand('insertHTML', false, textTileHTML);

                    setTimeout(() => {
                        const newTile = document.getElementById(tileId);
                        if (newTile) {
                            const contentArea = newTile.querySelector('.nk-text-tile-content');
                            if (contentArea) {
                                // If there was selected text, don't place cursor (text is already there)
                                // If empty, place cursor for immediate typing
                                if (!selectedText) {
                                    App.util.placeCursor(contentArea);
                                }
                            }
                        }
                    }, 50);

                    App.state.isArticleDirty = true;
                },

                insertWebLink(url) {
                    try {
                        let parsedUrl = new URL(url);
                        let domain = parsedUrl.hostname.replace(/^www\./, '');

                        // Beautiful, minimal aesthetic inline tag for any web link
                        let html = `
                        <span class="nk-web-link-container" contenteditable="false" style="display: inline-flex; align-items: center; justify-content: flex-start; gap: 6px; padding: 4px 12px; margin: 2px 4px; background: var(--bg-secondary, #f0f4f8); border: 1px solid var(--border-color, #d9e2ec); border-radius: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); user-select: text; transition: all 0.2s ease; word-break: break-all; max-width: 100%;">
                            <span style="font-size: 1.1em; line-height: 1; flex-shrink: 0;">🌐</span>
                            <a href="${url}" target="_blank" class="nk-web-link" style="text-decoration: none; color: var(--text-secondary); font-family: inherit; font-weight: 500; font-size: 0.9em;">${url}</a>
                        </span>&nbsp;`;

                        document.execCommand('insertHTML', false, html);
                        App.state.isArticleDirty = true;
                    } catch (e) {
                        App.ui.showToast('Invalid URL format', { type: 'error' });
                    }
                },

                copyAllMcqs() {
                    const article = document.getElementById('article-content');
                    if (!article) return;

                    const mcqBlocks = article.querySelectorAll('.nk-mcq-block');
                    if (mcqBlocks.length === 0) {
                        App.ui.showToast("No MCQs found in the current article.", { type: 'warning' });
                        return;
                    }

                    let htmlPayload = '';
                    let textPayload = '';

                    mcqBlocks.forEach((block, index) => {
                        const clone = block.cloneNode(true);
                        clone.removeAttribute('id');
                        clone.removeAttribute('data-answered');
                        clone.removeAttribute('data-user-incorrect');
                        clone.querySelectorAll('.nk-mcq-option').forEach(opt => {
                            opt.classList.remove('correct', 'incorrect');
                        });
                        // Remove any .nk-mcq-meta-bar elements
                        clone.querySelectorAll('.nk-mcq-meta-bar').forEach(el => el.remove());

                        htmlPayload += clone.outerHTML + '<p><br></p>';

                        const qEl = block.querySelector('.nk-mcq-question');
                        let textBlock = (qEl ? qEl.innerText : '').trim() + '\n';

                        let correctLabel = 'A';
                        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                        block.querySelectorAll('.nk-mcq-option').forEach((opt, idx) => {
                            const lbl = labels[idx] || 'A';
                            const optTextEl = opt.querySelector('.nk-mcq-option-text');
                            if (opt.getAttribute('data-is-correct') === 'true') correctLabel = lbl;
                            textBlock += lbl + ') ' + (optTextEl ? optTextEl.innerText : '').trim() + '\n';
                        });

                        textBlock += 'Correct Answer: ' + correctLabel + '\n';

                        const expEl = block.querySelector('.nk-mcq-explanation');
                        if (expEl) {
                            let expText = expEl.innerText.trim();
                            const diff = expEl.dataset.difficulty;
                            const tags = expEl.dataset.tags ? expEl.dataset.tags.split(',') : [];
                            const pyq = expEl.dataset.pyq;

                            if (diff && !expText.toLowerCase().includes(`#${diff.toLowerCase()}`)) {
                                expText += ` #${diff}`;
                            }
                            tags.forEach(t => {
                                const slug = t.trim().toLowerCase().replace(/\s+/g, '_');
                                if (slug && !expText.toLowerCase().includes(`#${slug}`)) {
                                    expText += ` #${slug}`;
                                }
                            });
                            if (pyq && !expText.toLowerCase().includes(`[[${pyq.toLowerCase()}]]`)) {
                                expText += ` [[${pyq}]]`;
                            }
                            if (expText) {
                                textBlock += 'Explanation: ' + expText + '\n';
                            }
                        }

                        textPayload += textBlock + (index < mcqBlocks.length - 1 ? '\n>>>\n' : '');
                    });

                    try {
                        const clipboardItem = new ClipboardItem({
                            "text/html": new Blob([htmlPayload], { type: "text/html" }),
                            "text/plain": new Blob([textPayload], { type: "text/plain" }),
                        });
                        navigator.clipboard.write([clipboardItem]).then(() => {
                            App.ui.showToast(`Copied ${mcqBlocks.length} MCQs to clipboard! Ready for Creator Studio.`, { type: 'success' });
                        }).catch(err => {
                            console.error('Failed to copy: ', err);
                            navigator.clipboard.writeText(textPayload);
                            App.ui.showToast(`Copied ${mcqBlocks.length} MCQs to clipboard! (Plain Text)`, { type: 'success' });
                        });
                    } catch (e) {
                        navigator.clipboard.writeText(textPayload);
                        App.ui.showToast(`Copied ${mcqBlocks.length} MCQs to clipboard! (Plain Text)`, { type: 'success' });
                    }
                },

                async pasteMcqs() {
                    const contentDiv = document.getElementById('article-content');
                    if (!contentDiv) {
                        App.ui.showToast("Please open a note first.", { type: 'error' });
                        return;
                    }
                    try {
                        let htmlContent = '';
                        
                        try {
                            const clipboardItems = await navigator.clipboard.read();
                            for (const item of clipboardItems) {
                                if (item.types.includes('text/html')) {
                                    const blob = await item.getType('text/html');
                                    htmlContent = await blob.text();
                                    break;
                                }
                            }
                        } catch {
                            htmlContent = await navigator.clipboard.readText();
                        }
                        if (!htmlContent || !htmlContent.trim()) {
                            App.ui.showToast("Clipboard is empty.", { type: 'warning' });
                            return;
                        }
                        if (!htmlContent.includes('nk-mcq-block')) {
                            App.ui.showToast(
                                'Clipboard does not contain native MCQKash MCQs. Use "Copy MCQ" from MCQKash first.',
                                { type: 'warning' }
                            );
                            return;
                        }
                        
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlContent;
                        
                        tempDiv.querySelectorAll('.nk-mcq-block[id]').forEach(b => b.removeAttribute('id'));
                        tempDiv.querySelectorAll('.nk-mcq-block').forEach(b => {
                            b.removeAttribute('data-answered');
                            b.removeAttribute('data-user-incorrect');
                            b.querySelectorAll('.nk-mcq-option').forEach(opt => {
                                opt.classList.remove('correct', 'incorrect');
                            });
                        });
                        tempDiv.querySelectorAll('.nk-mcq-meta-bar').forEach(el => el.remove());
                        
                        const cleanHtml = tempDiv.innerHTML;
                        const count = tempDiv.querySelectorAll('.nk-mcq-block').length;
                        
                        document.execCommand('insertHTML', false, cleanHtml + '<p><br></p>');
                        App.state.isArticleDirty = true;
                        
                        setTimeout(() => {
                            App.util.parseAllMcqMetadata();
                            if (App.state.currentMode === 'read') App.util.renderMcqCapsules();
                        }, 100);
                        App.ui.showToast(
                            `${count} MCQ${count > 1 ? 's' : ''} pasted with full native formatting restored!`,
                            { type: 'success' }
                        );
                    } catch (err) {
                        console.error('Paste MCQ failed:', err);
                        App.ui.showToast('Failed to read clipboard. Please grant clipboard permissions.', { type: 'error' });
                    }
                },

                convertSelectionToMcq() {
                    const selection = window.getSelection();
                    if (!selection || selection.isCollapsed) {
                        App.ui.showToast("Please select the text you want to convert.", { type: 'warning' });
                        return;
                    }

                    const text = selection.toString();
                    const mcqBlocks = App.util.parseMcqText(text);

                    if (!mcqBlocks || mcqBlocks.length === 0) {
                        App.ui.showToast("Could not parse as MCQ. Ensure you have a question line followed by at least 2 options (bullet points, letters, or numbered).", { type: 'error' });
                        return;
                    }

                    let processingToast = null;
                    if (mcqBlocks.length > 5) {
                        processingToast = App.ui.showToast(`Converting ${mcqBlocks.length} MCQs...`, { duration: 0, type: 'info' });
                    }

                    const fullHtml = mcqBlocks.map(block => {
                        const optionsHtml = block.options.map((optText, index) => {
                            let isCorrect = false;
                            if (block.correctAnswerLabel) {
                                const label = block.correctAnswerLabel;
                                if (/^[A-E]$/i.test(label)) {
                                    if (index === label.toUpperCase().charCodeAt(0) - 65) isCorrect = true;
                                } else if (/^[1-5]$/.test(label)) {
                                    if (index === parseInt(label) - 1) isCorrect = true;
                                }
                            }

                            return `
                            <div class="nk-mcq-option" data-is-correct="${isCorrect ? 'true' : 'false'}">
                                <div class="nk-mcq-option-radio"></div>
                                <div class="nk-mcq-option-text" contenteditable="true">${App.util.escapeHtml(optText)}</div>
                                <button class="nk-mcq-delete-option" title="Delete Option">&times;</button>
                            </div>
                        `}).join('');

                        // Parse metadata for the explanation element
                        let datasetAttrs = '';
                        if (block.explanation) {
                            const diffMatch = block.explanation.match(/#(easy|medium|hard)\b/i);
                            if (diffMatch) {
                                datasetAttrs += ` data-difficulty="${diffMatch[1].toLowerCase()}"`;
                            }
                            
                            const tagRegex = /#([\w]+)/g;
                            const DIFFICULTY_KEYWORDS = new Set(['easy', 'medium', 'hard']);
                            const tags = [];
                            let m;
                            while ((m = tagRegex.exec(block.explanation)) !== null) {
                                const raw = m[1];
                                if (DIFFICULTY_KEYWORDS.has(raw.toLowerCase())) continue;
                                const display = raw.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
                                if (!tags.includes(display)) tags.push(display);
                            }
                            if (tags.length > 0) {
                                datasetAttrs += ` data-tags="${tags.join(',')}"`;
                            }
                            
                            const pyqMatch = block.explanation.match(/\[\[([^\]]+)\]\]/);
                            if (pyqMatch) {
                                datasetAttrs += ` data-pyq="${pyqMatch[1].trim()}"`;
                            }
                        }

                        const expHtml = `<div class="nk-mcq-explanation" contenteditable="true" data-placeholder="Add answer explanation (optional)..."${datasetAttrs}>${block.explanation || ''}</div>`;

                        return `
                        <div class="nk-mcq-block" contenteditable="false">
                            <div class="nk-mcq-toolbar">
                                <button class="nk-mcq-copy-block" title="Copy MCQ"><i class="fa-solid fa-copy"></i></button>
                                <button class="nk-mcq-delete-block" title="Delete MCQ"><i class="fa-solid fa-trash"></i></button>
                            </div>
                            <div class="nk-mcq-question" contenteditable="true">${block.question}</div>
                            <div class="nk-mcq-options">${optionsHtml}</div>
                            <button class="btn btn-secondary nk-mcq-add-option">+ Add Option</button>
                            
                            ${expHtml}
                        </div>
                        <p><br></p>`;
                    }).join('');

                    document.execCommand('insertHTML', false, fullHtml);
                    App.state.isArticleDirty = true;

                    if (processingToast) App.ui.hideToast(processingToast);
                    const msg = mcqBlocks.length > 1 ? `Successfully converted ${mcqBlocks.length} MCQs!` : "Text smartly converted to MCQ!";
                    App.ui.showToast(msg, { type: 'success' });
                },

                clearFormatting() {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0) return;

                    if (!selection.isCollapsed) {
                        // --- DEFINITIVE FIX: Hybrid Undoable AND Powerful Cleanup ---

                        // Step 1: Run the native, undoable command. This handles basic tags and creates the undo history.
                        document.execCommand('removeFormat', false, null);

                        // Step 2: Perform a powerful, surgical cleanup for everything the native command missed.
                        const newSelection = window.getSelection();
                        if (newSelection.rangeCount > 0) {
                            const range = newSelection.getRangeAt(0);
                            const commonAncestor = range.commonAncestorContainer;
                            const parentElement = commonAncestor.nodeType === 3 ? commonAncestor.parentElement : commonAncestor;

                            if (parentElement) {
                                // Find the parent block to ensure we only clean within the right scope.
                                const parentBlock = parentElement.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div');

                                if (parentBlock) {
                                    // FIX: This selector is now comprehensive. It finds links, all highlight/color
                                    // classes, and any spans with inline styles (from /fontsize).
                                    const selector = 'a, span[class*="highlight-"], span[class*="text-"], span[style]';

                                    parentBlock.querySelectorAll(selector).forEach(elementToClean => {
                                        // We only unwrap the element if it's part of the user's selection.
                                        if (newSelection.containsNode(elementToClean, true)) {
                                            App.util.unwrapNode(elementToClean);
                                        }
                                    });
                                }
                            }
                        }

                        App.ui.showToast("Selection formatting cleared!", { type: 'success' });

                    } else {
                        const range = selection.getRangeAt(0);
                        const blockElement = range.startContainer.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div');

                        if (blockElement) {
                            blockElement.removeAttribute('style');
                            const highlightClasses = [...App.config.highlightClasses, ...App.config.textClasses];
                            blockElement.classList.remove(...highlightClasses);
                            blockElement.querySelectorAll('[style], [class*="highlight-"], [class*="text-"], b, i, u, strong, em, del, a, .rendered-tag').forEach(el => {
                                App.util.unwrapNode(el);
                            });
                            App.ui.showToast("Block formatting cleared.", { type: 'success' });
                        } else {
                            App.ui.showToast("Place cursor inside a block to clear its formatting.", { type: 'warning' });
                        }
                    }

                    App.state.isArticleDirty = true;
                },

                async filter() {
                    const query = this.els.input.value;
                    const hasSelection = !!App.state.savedRange;
                    clearTimeout(this.state.debounceTimeout);
                    const kashAskMatch = query.match(/^kashask\s+(.*)/i);
                    const kashTranslateMatch = query.match(/^kashtranslate\s+(.*)/i);
                    const kashOutlineMatch = query.match(/^kashoutline\s+(.*)/i);
                    const kashExtractMatch = query.match(/^kashextract\s*(.*)/i);
                    const kashLinkMatch = query.match(/^kashlink\s+(.*)/i);
                    const webMatch = query.match(/^web\s+(https?:\/\/[^\s]+)/i);
                    const tableMatch = query.match(/^table\s+(\d+)x(\d+)/i);

                    if (webMatch) {
                        this.state.mode = 'web';
                        const url = webMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'web-action',
                            title: `Insert Web Link`,
                            desc: url,
                            icon: '🌐',
                            url: url
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    if (tableMatch) {
                        this.state.mode = 'commands';
                        const rows = parseInt(tableMatch[1], 10);
                        const cols = parseInt(tableMatch[2], 10);
                        this.state.filteredResults = [{
                            id: 'table-dynamic',
                            title: `Insert Table ${rows}x${cols}`,
                            desc: `Create (or Resize) table to ${rows} rows and ${cols} columns`,
                            icon: '▦',
                            execute: () => {
                                const selection = window.getSelection();
                                if (selection.rangeCount > 0) {
                                    let anchor = selection.anchorNode;
                                    if (anchor.nodeType === 3) anchor = anchor.parentElement;
                                    const table = anchor.closest('table');
                                    if (table) {
                                        App.events.table.update(table, rows, cols);
                                        App.ui.showToast(`Table resized to ${rows}x${cols}`, { type: 'success' });
                                    } else {
                                        App.events.table.create(rows, cols);
                                        App.ui.showToast(`Inserted ${rows}x${cols} Table`, { type: 'success' });
                                    }
                                } else {
                                    App.events.table.create(rows, cols);
                                }
                            }
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    if (kashAskMatch) {
                        this.state.mode = 'kashask';
                        const prompt = kashAskMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'kashask-action',
                            title: `Ask AI: "${prompt}"`,
                            desc: 'Press Enter to get an answer from the AI',
                            icon: '❓',
                            prompt: prompt
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    if (kashTranslateMatch) {
                        this.state.mode = 'kashtranslate';
                        const language = kashTranslateMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'kashtranslate-action',
                            title: `Translate selection to ${language}`,
                            desc: 'Press Enter to translate',
                            icon: '🌐',
                            language: language
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }
                    if (kashOutlineMatch) {
                        this.state.mode = 'kashoutline';
                        const topic = kashOutlineMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'kashoutline-action',
                            title: `Generate Outline for: "${topic}"`,
                            desc: 'Press Enter to generate the outline',
                            icon: '📜',
                            topic: topic
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }
                    if (kashExtractMatch) {
                        this.state.mode = 'kashextract';
                        const subCommand = kashExtractMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'kashextract-action',
                            title: subCommand ? `Extract: "${subCommand}"` : 'Extract: Article Summary',
                            desc: 'Press Enter to query the article content',
                            icon: '🔍',
                            subCommand: subCommand || 'default'
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    if (kashLinkMatch) {
                        this.state.mode = 'kashlink';
                        const topic = kashLinkMatch[1].trim();
                        this.state.filteredResults = [{
                            id: 'kashlink-action',
                            title: `Create & Link Note: "${topic}"`,
                            desc: 'Press Enter to generate a new note and link it here',
                            icon: '🔗',
                            topic: topic
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }





                    const mapMatch = query.match(/^map\s+(.*)/i);
                    if (mapMatch) {
                        this.state.mode = 'map';
                        let rawQuery = mapMatch[1].trim();

                        // Parse for map type keywords
                        let mapType = 'm'; // Default: m = roadmap
                        let mapTypeName = 'Roadmap';
                        let cleanQuery = rawQuery;

                        if (/\b(?:earth|satellite)\b/i.test(rawQuery)) {
                            mapType = 'k'; // k = satellite
                            mapTypeName = 'Satellite';
                            cleanQuery = rawQuery.replace(/\b(?:earth|satellite)\b/gi, '').trim();
                        } else if (/\b(?:terrain|physical)\b/i.test(rawQuery)) {
                            mapType = 'p'; // p = terrain
                            mapTypeName = 'Terrain';
                            cleanQuery = rawQuery.replace(/\b(?:terrain|physical)\b/gi, '').trim();
                        } else if (/\b(?:hybrid)\b/i.test(rawQuery)) {
                            mapType = 'h'; // h = hybrid
                            mapTypeName = 'Hybrid';
                            cleanQuery = rawQuery.replace(/\b(?:hybrid)\b/gi, '').trim();
                        }

                        this.state.filteredResults = [{
                            id: 'map-action',
                            title: `Insert ${mapTypeName} Map`,
                            desc: cleanQuery ? `Location: ${cleanQuery}` : 'Type a location...',
                            icon: '🗺️',
                            execute: () => {
                                if (!cleanQuery) return;
                                const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cleanQuery)}&t=${mapType}&ie=UTF8&iwloc=&output=embed`;

                                // Premium styling with Controls:
                                const mapHtml = `
                                <div class="nk-map-embed" contenteditable="false" tabindex="0" style="width: 100%; max-width: 800px; aspect-ratio: 16/9; margin: 25px auto; border-radius: 16px; overflow: hidden; background: var(--bg-secondary, #222); box-shadow: 0 8px 30px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.1); position: relative; resize: both; min-width: 300px; min-height: 200px;">
                                    <div class="nk-map-controls">
                                        <div class="nk-map-btn" data-action="fullscreen" onclick="App.handleMapAction(event, 'fullscreen')" title="Toggle Fullscreen"><i class="fa-solid fa-expand"></i></div>
                                        <div class="nk-map-btn" data-action="edit" onclick="App.handleMapAction(event, 'edit')" title="Edit Location"><i class="fa-solid fa-pen"></i></div>
                                        <div class="nk-map-btn is-delete" data-action="delete" onclick="App.handleMapAction(event, 'delete')" title="Remove Map"><i class="fa-solid fa-xmark"></i></div>
                                    </div>
                                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none; display: block;" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:-1;"></div>
                                </div>
                                <p><br></p>`;

                                App.util.insertGuardianBlock(mapHtml);
                                App.state.isArticleDirty = true;
                                App.ui.showToast(`Embedded ${mapTypeName} map found!`, { type: 'success' });
                            }


                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    const videoMatch = query.match(/^video\s+((?:https?:\/\/)?\S+)/i);
                    if (videoMatch) {
                        this.state.mode = 'video';
                        let url = videoMatch[1];
                        if (!/^(https?:\/\/)/i.test(url)) url = 'https://' + url;

                        let platform = 'generic';
                        let videoId = null;
                        let embedUrl = url;
                        let displayTitle = 'Embed Video';
                        let displayIcon = '🎬';
                        let isYoutubeShort = false;

                        // 1. YouTube (including Shorts)
                        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                        if (ytMatch) {
                            platform = 'youtube';
                            videoId = ytMatch[1];
                            isYoutubeShort = /\/shorts\//i.test(url);
                            embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
                            displayTitle = isYoutubeShort ? 'Embed YouTube Short' : 'Embed YouTube Video';
                            displayIcon = '📺';
                        }

                        // 2. Twitter / X
                        if (platform === 'generic') {
                            const twMatch = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/i);
                            if (twMatch) {
                                platform = 'twitter';
                                videoId = twMatch[2]; // Captures the ID
                                // Use the platform.twitter.com embed endpoint for iframes
                                embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${videoId}&dnt=false&theme=light`;
                                displayTitle = 'Embed Tweet/Video';
                                displayIcon = '🐦'; // Bird
                            }
                        }

                        // 3. Instagram
                        if (platform === 'generic') {
                            const igMatch = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
                            if (igMatch) {
                                platform = 'instagram';
                                videoId = igMatch[1];
                                embedUrl = `https://www.instagram.com/p/${videoId}/embed`;
                                displayTitle = 'Embed Instagram Post';
                                displayIcon = '📸'; // Camera
                            }
                        }

                        this.state.filteredResults = [{
                            id: 'video-action',
                            title: displayTitle,
                            desc: videoId ? `ID: ${videoId} • Source: ${platform}` : url,
                            icon: displayIcon,
                            url: url,
                            platform: platform,
                            execute: () => {
                                // Default styling for 16:9 videos
                                let containerStyle = "width: 100%; max-width: 800px; aspect-ratio: 16/9; margin: 10px auto; border-radius: 12px; overflow: hidden; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); resize: both;";
                                let showAlignBtn = false;
                                if (platform === 'instagram' || isYoutubeShort) {
                                    containerStyle = "width: 320px; max-width: 100%; aspect-ratio: 9/16; margin: 25px auto; border-radius: 12px; overflow: hidden; background: transparent; box-shadow: 0 8px 30px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.05); resize: both;";
                                    showAlignBtn = true;
                                } else if (platform === 'twitter') {
                                    containerStyle = "width: 400px; max-width: 100%; height: 600px; min-height: 300px; margin: 25px auto; border-radius: 12px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; background: transparent; resize: both;";
                                    showAlignBtn = true;
                                }

                                const alignBtnHtml = showAlignBtn ? `<div class="nk-video-align-btn" title="Toggle Newspaper Mode"><i class="fa-solid fa-align-left"></i></div>` : '';

                                let iframeHtml = '';
                                if (platform === 'youtube') {
                                    const ratioAttr = isYoutubeShort ? 'data-ratio="9:16"' : '';
                                    iframeHtml = `
                                <div class="nk-video-embed" contenteditable="false" tabindex="0" style="${containerStyle}">
                                    <div class="nk-video-delete-btn" title="Remove Video"><i class="fa-solid fa-xmark"></i></div>
                                    ${alignBtnHtml}
                                    <div class="nk-plyr-wrapper" data-provider="youtube" data-embed-id="${videoId}" ${ratioAttr}>
                                        <div class="js-plyr-video" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}" ${ratioAttr}></div>
                                    </div>
                                </div>
                                <p><br></p>`;
                                    // Auto-init Plyr after insertion
                                    setTimeout(() => App.util.initPlyr(document.getElementById('article-content')), 100);
                                } else {
                                    // Standard iframe for others (Twitter/Instagram) - keeping existing logic
                                    iframeHtml = `
                                <div class="nk-video-embed" contenteditable="false" tabindex="0" style="${containerStyle}">
                                    <div class="nk-video-delete-btn" title="Remove Video"><i class="fa-solid fa-xmark"></i></div>
                                    ${alignBtnHtml}
                                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                                </div>
                                <p><br></p>`;
                                }

                                App.util.insertGuardianBlock(iframeHtml);
                                App.state.isArticleDirty = true;
                                App.ui.showToast(`${displayTitle} embedded!`, { type: 'success' });
                            }
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    const clipMatch = query.match(/^clip\s+((?:https?:\/\/)?\S+)/i);
                    if (clipMatch) {
                        this.state.mode = 'clip';
                        let url = clipMatch[1];

                        if (!/^(https?:\/\/)/i.test(url)) {
                            url = 'https://' + url;
                        }
                        this.state.filteredResults = [{
                            id: 'clip-action',
                            title: `Clip Content from URL`,
                            desc: url,
                            icon: '✂️',
                            url: url
                        }];
                        this.state.selectedIndex = 0;
                        this.render();
                        return;
                    }

                    const categoryMatch = query.match(/^category\s*(.*)/i);
                    if (query.toLowerCase().startsWith('define ')) {
                        this.state.mode = 'definitions';
                        const searchTerm = query.substring(7).trim();
                        if (searchTerm.length === 0) {
                            this.state.filteredResults = [{ type: 'definition-prompt', title: 'e.g., define serendipity', desc: 'Type a word to get its definition.' }];
                        } else if (searchTerm.length >= 2) {
                            this.state.isFetching = true; this.render();
                            this.state.debounceTimeout = setTimeout(async () => {
                                this.state.filteredResults = await this.fetchDefinition(searchTerm);
                                this.render();
                            }, 400);
                            return;
                        } else {
                            this.state.filteredResults = [];
                        }
                    } else if (query.toLowerCase().startsWith('hig ')) {
                        this.state.mode = 'block-highlight';
                        const searchTerm = query.substring(4).trim().toLowerCase();
                        this.state.filteredResults = searchTerm ? this.state.highlightOptions.filter(opt => opt.id.toLowerCase().startsWith(searchTerm) || opt.title.toLowerCase().includes(searchTerm)) : this.state.highlightOptions;
                    } else if (query.toLowerCase().startsWith('link ')) {
                        if (!this.state.fuse.links) {
                            App.ui.showToast('Indexing items for linking...', { type: 'info', duration: 1500 });
                            const linkableData = [
                                ...App.state.articles.map(a => ({ type: 'article', id: a.id, title: a.title, desc: `Article: ${a.title}` })),
                                ...App.util.extractSnippets(null, ['highlight', 'mindmap']).map(s => ({ type: s.type === 'mindmap' ? 'mindmap_snippet' : 'snippet', id: s.id, title: s.text, desc: `${s.type === 'mindmap' ? 'Mindmap Node' : 'Snippet'} in: ${App.storage.getArticle(s.articleId)?.title}`, articleId: s.articleId }))
                            ];


                            // Re-index tags for "link" command specifically (User request #1-c)
                            Object.values(App.state.tags).forEach(tag => {
                                linkableData.push({
                                    type: 'tag',
                                    id: tag.displayName, // Use name as ID for tags here
                                    title: tag.displayName,
                                    desc: `Tag used in ${tag.articles ? tag.articles.length : 0} notes`,
                                    articleId: tag.articles ? tag.articles[0] : null // Keep a reference to one article for context
                                });
                            });

                            this.state.fuse.links = App.offline.safeFuse(linkableData, { keys: ['title', 'desc'], threshold: 0.3 });
                        }
                        this.state.mode = 'links'; const searchTerm = query.substring(5).trim();
                        if (!searchTerm) { this.state.filteredResults = App.state.articles.slice(0, 500).map(a => ({ type: 'article', id: a.id, title: a.title, desc: `Article: ${a.title}` })); } else { this.state.filteredResults = this.state.fuse.links.search(searchTerm).map(r => r.item); }
                    } else if (query.toLowerCase().startsWith('tag ')) {
                        if (!this.state.fuse.tags) { const tagData = Object.values(App.state.tags).map(tag => ({ ...tag, articleId: tag.articles ? tag.articles[0] : null })); this.state.fuse.tags = App.offline.safeFuse(tagData, { keys: ['displayName'], threshold: 0.3 }); }
                        this.state.mode = 'tags'; const searchTerm = query.substring(4).trim();
                        if (!searchTerm) { this.state.filteredResults = Object.values(App.state.tags).sort((a, b) => a.displayName.localeCompare(b.displayName)); } else { this.state.filteredResults = this.state.fuse.tags.search(searchTerm).map(r => r.item); }
                    } else if (categoryMatch) {
                        this.state.mode = 'categories';
                        const searchTerm = categoryMatch[1].trim(); // Get the search term from the regex
                        const userCategories = App.settings.get('userCategories');
                        const categoryData = userCategories.map(c => ({
                            id: c.name, // The internal name for execution
                            name: App.util.getCategoryDisplayName(c.name) // The display name for UI
                        }));
                        if (!this.state.fuse.categories) {
                            this.state.fuse.categories = App.offline.safeFuse(categoryData, { keys: ['name'], threshold: 0.3 });
                        }

                        if (!searchTerm) {
                            this.state.filteredResults = categoryData.sort((a, b) => a.name.localeCompare(b.name));
                        } else {
                            this.state.filteredResults = this.state.fuse.categories.search(searchTerm).map(r => r.item);
                        }
                    } else if (query.toLowerCase().startsWith('emoji')) {
                        this.state.mode = 'emojis';
                        const arg = query.substring(5).trim(); // Get text after 'emoji'

                        if (arg) {
                            // If there's a search term, filter emojis
                            this.state.filteredResults = this.state.fuse.emojis.search(arg).map(r => r.item);
                        } else {
                            // If just 'emoji' or 'emoji ', show all emojis
                            this.state.filteredResults = this.state.emojiData;
                        }
                    } else if (query.toLowerCase().startsWith('icon')) {
                        this.state.mode = 'icons';
                        const arg = query.substring(4).trim(); // Get text after 'icon'

                        if (arg) {
                            // If there's a search term, filter icons
                            this.state.filteredResults = this.state.fuse.icons.search(arg).map(r => r.item);
                        } else {
                            // If just 'icon' or 'icon ', show all icons
                            this.state.filteredResults = this.state.iconData;
                        }
                    } else if (query.toLowerCase().startsWith('img ') || query.toLowerCase() === 'img') {
                        // Handle /img command - insert external URL-based image
                        this.state.mode = 'img';
                        const url = query.substring(3).trim();

                        if (url) {
                            // User provided a URL
                            this.state.filteredResults = [{
                                id: 'img-action',
                                title: 'Insert External Image',
                                desc: url,
                                icon: '🔗',
                                url: url
                            }];
                        } else {
                            // Just 'img' - show help
                            this.state.filteredResults = [{
                                id: 'img-help',
                                title: 'External Image',
                                desc: 'Type: img https://example.com/image.jpg',
                                icon: '🔗'
                            }];
                        }
                    } else if (query.toLowerCase().startsWith('textile ')) { // NEW: Handle /textile command for initial text
                        this.state.mode = 'commands'; // Still in commands mode, but pre-populating a command
                        const text = query.substring(8).trim();
                        this.state.filteredResults = [{
                            id: 'textile-dynamic',
                            title: 'Insert Text Tile',
                            desc: text || 'Create a visually distinct text block',
                            icon: '📝',
                            execute: () => App.commandPalette.insertTextTile()
                        }];
                    } else if (query.toLowerCase().startsWith('fontsize')) {
                        this.state.mode = 'font-sizes';
                        const arg = query.substring(8).trim();
                        let results = [];

                        if (arg) {
                            // Smart handling: if user types a number, try to match it to a rem size
                            const numValue = parseFloat(arg);
                            if (!isNaN(numValue) && isFinite(numValue)) {
                                // Convert to rem if it's just a number
                                const remValue = `${numValue}rem`;

                                // Check if this exact size exists in our options
                                if (this.state.fontSizeOptions.includes(remValue)) {
                                    results.push(remValue);
                                }
                            }

                            // Also do fuzzy search to show related options
                            if (!this.state.fuse.fontSizes) {
                                this.state.fuse.fontSizes = App.offline.safeFuse(this.state.fontSizeOptions);
                            }
                            results = results.concat(this.state.fuse.fontSizes.search(arg).map(r => r.item));
                        } else {
                            results = this.state.fontSizeOptions;
                        }

                        this.state.filteredResults = [...new Set(results)];
                    } else if (query.toLowerCase().startsWith('fontfamily') || query.toLowerCase().startsWith('fontfam')) {
                        this.state.mode = 'font-families';
                        const commandLength = query.toLowerCase().startsWith('fontfamily') ? 10 : 7;
                        const arg = query.substring(commandLength).trim();
                        this.state.filteredResults = arg ? this.state.fuse.fontFamilies.search(arg).map(r => r.item) : this.state.fontFamilyOptions;
                    } else {
                        this.state.mode = 'commands';
                        let results = query ? this.state.fuse.commands.search(query).map(r => r.item) : this.state.commands;
                        if (!hasSelection) {
                            results = results.filter(cmd => !cmd.selection);
                        }
                        this.state.filteredResults = results;
                    }

                    this.state.selectedIndex = 0;
                    this.render();
                },

                render() {
                    if (this.state.isFetching) { this.els.list.innerHTML = `<div class="command-item"><div class="command-item-icon spin">📖</div><div class="command-item-text"><div class="command-item-title">Fetching definition...</div></div></div>`; return; }
                    if (this.state.filteredResults.length === 0) { this.els.list.innerHTML = `<div class="command-item"><div class="command-item-text"><div class="command-item-title">No results found</div></div></div>`; return; }

                    // 🎨 SPECIAL GRID LAYOUT FOR EMOJIS - Space-efficient & modern!
                    if (this.state.mode === 'emojis') {
                        const gridHTML = this.state.filteredResults.map((item, index) => {
                            const isSelected = index === this.state.selectedIndex ? 'selected' : '';
                            return `<div class="emoji-grid-item ${isSelected}" data-index="${index}" title="${App.util.escapeHtml(item.name || 'Emoji')}">${item.e}</div>`;
                        }).join('');

                        this.els.list.innerHTML = `<div class="emoji-grid">${gridHTML}</div>`;
                        this.els.list.querySelectorAll('.emoji-grid-item').forEach(item => {
                            item.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                this.state.selectedIndex = parseInt(e.currentTarget.dataset.index, 10);
                                this.execute();
                            });
                        });
                        this._updateSelection();
                        return;
                    }

                    // 🎨 SPECIAL GRID LAYOUT FOR ICONS - Similar treatment
                    if (this.state.mode === 'icons') {
                        const gridHTML = this.state.filteredResults.map((item, index) => {
                            const isSelected = index === this.state.selectedIndex ? 'selected' : '';
                            return `<div class="emoji-grid-item ${isSelected}" data-index="${index}" title="${App.util.escapeHtml(item.icon)}"><i class="${item.class}"></i></div>`;
                        }).join('');

                        this.els.list.innerHTML = `<div class="emoji-grid">${gridHTML}</div>`;
                        this.els.list.querySelectorAll('.emoji-grid-item').forEach(item => {
                            item.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                this.state.selectedIndex = parseInt(e.currentTarget.dataset.index, 10);
                                this.execute();
                            });
                        });
                        this._updateSelection();
                        return;
                    }

                    // Regular list rendering for other modes
                    this.els.list.innerHTML = this.state.filteredResults.map((item, index) => {
                        let icon = '?', title = 'Unknown', desc = '';

                        switch (this.state.mode) {
                            case 'kashask':
                            case 'kashtranslate':
                                icon = item.icon;
                                title = item.title;
                                desc = item.desc;
                                break;
                            case 'definitions':
                                if (item.type === 'definition-prompt') {
                                    icon = '✍️'; title = item.title; desc = item.desc;
                                } else if (item.error) {
                                    icon = '😕'; title = item.error; desc = 'Try another word.';
                                } else { icon = '📖'; title = `${item.word} (${item.partOfSpeech})`; desc = item.definition; }
                                break;
                            case 'block-highlight': icon = item.icon; title = item.title; desc = item.desc; break;
                            case 'links': icon = item.type === 'article' ? '📄' : '💬'; title = item.title; desc = item.desc; break;
                            case 'tags': icon = '🏷️'; title = item.displayName; desc = `Insert tag: ${item.displayName}`; break;
                            case 'categories': icon = '📂'; title = item.name; desc = `Set article category to ${item.name}`; break;
                            case 'font-sizes':
                                icon = 'Aa';
                                const fullText = `${item} is font-size`;
                                return `<div class="command-item ${index === this.state.selectedIndex ? 'selected' : ''}" data-index="${index}">
                                        <div class="command-item-icon">${icon}</div>
                                        <div class="command-item-text">
                                            <div class="command-item-title" style="font-size: ${item}; font-weight: 500;">${fullText}</div>
                                        </div>
                                    </div>`;
                            case 'font-families':
                                icon = 'Ab';
                                title = item.name;
                                desc = `Apply font family: ${item.value.split(',')[0]}`;
                                return `<div class="command-item ${index === this.state.selectedIndex ? 'selected' : ''}" data-index="${index}"><div class="command-item-icon">${icon}</div><div class="command-item-text"><div class="command-item-title" style="font-family: ${item.value};">${App.util.escapeHtml(title)}</div><div class="command-item-desc">${App.util.escapeHtml(desc)}</div></div></div>`;
                            default: icon = item.icon; title = item.title; desc = item.desc; break;
                        }
                        return `<div class="command-item ${index === this.state.selectedIndex ? 'selected' : ''}" data-index="${index}"><div class="command-item-icon">${icon}</div><div class="command-item-text"><div class="command-item-title">${App.util.escapeHtml(title)}</div><div class="command-item-desc">${App.util.escapeHtml(desc)}</div></div></div>`;
                    }).join('');

                    // --- NEW: Logic to add the premium upsell message for Spark Tier users ---
                    if (!App.license.isPremium()) {
                        const wittyMessage = App.util.getRandomMessage(App.util.wittyDeveloperMessages);
                        const upsellHTML = `
                        <div id="command-palette-upsell" class="command-item" style="cursor: pointer; border-top: 1px solid var(--border-color); margin-top: 4px; padding-top: 8px;">
                            <div class="command-item-icon">💎</div>
                            <div class="command-item-text">
                                <div class="command-item-title" style="color: var(--primary-color);">Unlock Pro Commands</div>
                                <div class="command-item-desc">${wittyMessage}</div>
                            </div>
                        </div>`;
                        this.els.list.insertAdjacentHTML('beforeend', upsellHTML);
                        const upsellEl = document.getElementById('command-palette-upsell');
                        if (upsellEl) {
                            upsellEl.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                App.ui.showAscensionModal();
                                this.close();
                            });
                        }
                    }
                    // --- END of new logic ---

                    this.els.list.querySelectorAll('.command-item:not(#command-palette-upsell)').forEach(item => { item.addEventListener('mousedown', (e) => { e.preventDefault(); this.state.selectedIndex = parseInt(e.currentTarget.dataset.index, 10); this.execute(); }); });
                    this._updateSelection();
                },

                applyStyle(property, value) {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0) return;

                    const range = selection.getRangeAt(0);
                    const contentDiv = document.getElementById('article-content');

                    if (!contentDiv.contains(range.commonAncestorContainer)) return;
                    if (!selection.isCollapsed) {
                        const span = document.createElement('span');
                        span.style[property] = value;

                        // Mark user-applied font-family so it's preserved on paste
                        if (property === 'fontFamily') {
                            span.setAttribute('data-user-font', 'true');
                        }

                        try {
                            range.surroundContents(span);
                        } catch (e) {
                            console.warn("Could not use surroundContents, falling back to insertHTML.", e);
                            const userFontAttr = property === 'fontFamily' ? ' data-user-font="true"' : '';
                            document.execCommand('insertHTML', false, `<span style="${property.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value};"${userFontAttr}>${selection.toString()}</span>`);
                        }
                    }
                    else {
                        let blockElement = range.startContainer;
                        if (blockElement.nodeType === Node.TEXT_NODE) {
                            blockElement = blockElement.parentElement;
                        }

                        blockElement = blockElement.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, div');

                        if (blockElement && contentDiv.contains(blockElement)) {
                            blockElement.style[property] = value;

                            // Mark user-applied font-family so it's preserved on paste
                            if (property === 'fontFamily') {
                                blockElement.setAttribute('data-user-font', 'true');
                            }
                        }
                    }

                    App.state.isArticleDirty = true;
                },

                execute() {
                    const item = this.state.filteredResults[this.state.selectedIndex];
                    if (!item || item.type === 'suggestion') return;

                    if (item.type === 'premium-upsell') {
                        App.ui.showAscensionModal();
                        this.close();
                        return; // Stop execution here.
                    }

                    if (this.state.isPreviewActive) {
                        this._restoreEditor();
                    }

                    if (App.state.savedRange) {
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(App.state.savedRange);
                    } else if (this.state.cursorMarkerId) {
                        const markerNode = document.getElementById(this.state.cursorMarkerId);
                        if (markerNode) {
                            const sel = window.getSelection();
                            const range = document.createRange();
                            range.setStartBefore(markerNode);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            markerNode.parentNode.removeChild(markerNode);
                        }
                    }
                    App.state.savedRange = null;
                    this.state.cursorMarkerId = null;

                    try {
                        switch (this.state.mode) {
                            case 'kashask':
                                if (item.prompt) App.events.ai.executeKashAsk(item.prompt);
                                break;
                            case 'web':
                                if (item.url) this.insertWebLink(item.url);
                                break;
                            case 'kashtranslate':
                                if (item.language) App.events.ai.executeKashTranslate(item.language);
                                break;
                            case 'kashextract':
                                if (item.subCommand) App.events.ai.executeKashExtract(item.subCommand);
                                break;
                            case 'kashlink':
                                if (item.topic) App.events.ai.executeKashLink(item.topic);
                                break;
                            case 'kashoutline':
                                if (item.topic) App.events.ai.executeKashOutline(item.topic);
                                break;
                            case 'block-highlight': this.applyBlockHighlight(item.className); break;
                            case 'links':
                                if (item.type === 'mindmap_snippet') {
                                    document.execCommand('insertHTML', false, `<a href="#" data-link-type="mindmap_snippet" data-article-id="${item.articleId}" data-link-id="${item.id}">${item.title}</a>`);
                                } else {
                                    document.execCommand('insertHTML', false, item.type === 'snippet' ? `<a href="#" data-link-type="snippet" data-article-id="${item.articleId}" data-link-id="${item.id}">${item.title}</a>` : `<a href="#" data-link-type="article" data-link-id="${item.id}">${item.title}</a>`);
                                }
                                break;
                            case 'tags': document.execCommand('insertHTML', false, `<span class="rendered-tag" data-tag="${item.id}">${item.displayName}</span>`); break;
                            case 'categories': const categorySelector = document.getElementById('category-selector'); if (categorySelector) { categorySelector.value = item.id; App.events.saveArticle({ isAutosave: true }); App.ui.showToast(`Category set to ${item.name}`, { type: 'success' }); } break;
                            case 'font-sizes':
                                // Validate that this is an allowed font size
                                if (this.state.fontSizeOptions.includes(item)) {
                                    this.applyStyle('fontSize', item);
                                } else {
                                    App.ui.showToast(`Font size "${item}" is not available. Please use sizes from 0.8rem to 2.5rem (in 0.1 increments) or 3rem.`, { type: 'error' });
                                }
                                break;
                            case 'font-families':
                                const freeFonts = [
                                    'Arial, Helvetica, sans-serif', 'Cambria, Cochin, Georgia, Times, "Times New Roman", serif',
                                    "'Courier New', Courier, monospace", 'Garamond, serif', 'Georgia, serif',
                                    'Helvetica, Arial, sans-serif', 'Monaco, "Lucida Console", monospace',
                                    'Palatino, "Palatino Linotype", serif', 'sans-serif', "'Times New Roman', Times, serif",
                                    'Verdana, Geneva, sans-serif'
                                ];
                                const isPremiumFont = !freeFonts.includes(item.value);

                                if (isPremiumFont && !App.license.isPremium()) {
                                    App.ui.showAscensionModal();
                                } else {
                                    this.applyStyle('fontFamily', item.value);
                                }
                                break;
                            case 'emojis': document.execCommand('insertText', false, item.e); break;
                            case 'icons':
                                // Insert as an inline element, but keep caret OUT of the <i> (prevents FontAwesome font "leaking" into typed text)
                                (() => {
                                    const selection = window.getSelection();
                                    const contentDiv = document.getElementById('article-content');
                                    if (!selection || selection.rangeCount === 0 || !contentDiv) {
                                        document.execCommand('insertHTML', false, `<span class="nk-inline-icon" data-nk-inline-icon="1"><i class="${item.class}"></i></span> `);
                                        return;
                                    }

                                    const range = selection.getRangeAt(0);
                                    if (!contentDiv.contains(range.commonAncestorContainer)) {
                                        document.execCommand('insertHTML', false, `<span class="nk-inline-icon" data-nk-inline-icon="1"><i class="${item.class}"></i></span> `);
                                        return;
                                    }

                                    range.deleteContents();
                                    const wrapper = document.createElement('span');
                                    wrapper.className = 'nk-inline-icon';
                                    wrapper.setAttribute('data-nk-inline-icon', '1');

                                    const iconEl = document.createElement('i');
                                    iconEl.className = item.class;
                                    iconEl.setAttribute('contenteditable', 'false');
                                    iconEl.setAttribute('aria-hidden', 'true');
                                    wrapper.appendChild(iconEl);

                                    range.insertNode(wrapper);
                                    const trailingSpace = document.createTextNode(' ');
                                    wrapper.parentNode.insertBefore(trailingSpace, wrapper.nextSibling);

                                    const newRange = document.createRange();
                                    newRange.setStartAfter(trailingSpace);
                                    newRange.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(newRange);
                                })();
                                break;
                            case 'definition-prompt': break;
                            case 'definitions':
                                if (item.error) { App.ui.showToast(item.error, 'error'); break; }
                                let definitionHTML = `<b>${item.word}</b> (<i>${item.partOfSpeech}</i>)<blockquote>${item.definition}</blockquote>`;
                                if (item.synonyms) { definitionHTML += `<p><b>Synonyms:</b> ${item.synonyms}</p>`; }
                                definitionHTML += `<p><br></p>`;
                                document.execCommand('insertHTML', false, definitionHTML);
                                break;
                            case 'clip':
                                if (item && item.url) {
                                    App.contentTools.clipArticle(item.url);
                                }
                                break;
                            case 'img':
                                // Get URL from: 1) typed after command, 2) selected text, 3) current line
                                let imageUrl = '';

                                if (item && item.url) {
                                    // URL provided directly via command (e.g., "img https://...")
                                    imageUrl = item.url.trim();
                                } else {
                                    // Try to get URL from selection or current line
                                    const sel = window.getSelection();
                                    const selectedText = sel.toString().trim();

                                    if (selectedText && /^(https?:\/\/|www\.)/i.test(selectedText)) {
                                        // Selected text is a URL
                                        imageUrl = selectedText;
                                    } else if (sel.rangeCount > 0) {
                                        // Check current line for URL
                                        const range = sel.getRangeAt(0);
                                        let lineNode = range.startContainer;
                                        // Get parent element for text nodes
                                        if (lineNode.nodeType === Node.TEXT_NODE) {
                                            lineNode = lineNode.parentElement;
                                        }
                                        // Find block-level parent (p, div, etc.)
                                        while (lineNode && !['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(lineNode.tagName)) {
                                            lineNode = lineNode.parentElement;
                                        }
                                        if (lineNode) {
                                            const lineText = lineNode.textContent.trim();
                                            // Extract URL from line using regex
                                            const urlMatch = lineText.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
                                            if (urlMatch) {
                                                imageUrl = urlMatch[0];
                                            }
                                        }
                                    }
                                }

                                if (!imageUrl) {
                                    App.ui.showToast('No image URL found. Select a URL or type: img https://...', { type: 'warning' });
                                    break;
                                }

                                // Auto-add https if missing protocol
                                if (!/^(https?:\/\/)/i.test(imageUrl)) {
                                    imageUrl = 'https://' + imageUrl;
                                }
                                // Validate URL format
                                try {
                                    new URL(imageUrl);
                                } catch {
                                    App.ui.showToast('Invalid URL format', { type: 'error' });
                                    break;
                                }

                                // If selected text was used, remove it first
                                const selForRemoval = window.getSelection();
                                if (selForRemoval.toString().trim() && /^(https?:\/\/|www\.)/i.test(selForRemoval.toString().trim())) {
                                    document.execCommand('delete', false, null);
                                } else if (selForRemoval.rangeCount > 0) {
                                    // Remove the entire line if URL was extracted from it
                                    const range = selForRemoval.getRangeAt(0);
                                    let lineNode = range.startContainer;
                                    if (lineNode.nodeType === Node.TEXT_NODE) {
                                        lineNode = lineNode.parentElement;
                                    }
                                    while (lineNode && !['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(lineNode.tagName)) {
                                        lineNode = lineNode.parentElement;
                                    }
                                    if (lineNode && lineNode.textContent.includes(imageUrl.replace('https://', '').replace('http://', ''))) {
                                        lineNode.remove();
                                    }
                                }

                                // Insert external image with same styling as regular images
                                const imgHtml = `<div class="image-container image-external" contenteditable="false"><img src="${imageUrl}" alt="External image" style="max-width:100%; height:auto; border-radius: var(--border-radius);" onerror="this.parentElement.classList.add('image-load-error')"><div class="resize-handle resize-handle-se"></div></div>`;
                                document.execCommand('insertHTML', false, `<p>${imgHtml}</p><p><br></p>`);
                                App.state.isArticleDirty = true;
                                App.ui.showToast('External image inserted!', { type: 'success' });
                                break;
                            default:
                                if (item.isPremium && !App.license.isPremium()) {
                                    App.ui.showAscensionModal();
                                } else if (item.execute) {
                                    item.execute();
                                }
                                break;
                        }
                    } catch (e) {
                        console.error("Command execution failed:", e);
                        if (item.isPremium && !App.license.isPremium()) {
                            App.ui.showToast("This is a Premium feature. Upgrade to unlock.", "warning");
                        } else {
                            App.ui.showToast('Command failed.', 'error');
                        }
                    }

                    const selection = window.getSelection();
                    const savedCursorRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

                    // Save scroll position
                    const mainContainer = document.querySelector('main');
                    const savedScrollTop = mainContainer ? mainContainer.scrollTop : 0;

                    this.els.palette.style.display = 'none';

                    const contentDiv = document.getElementById('article-content');
                    if (contentDiv) {
                        // Focus WITHOUT scrolling using preventScroll option
                        contentDiv.focus({ preventScroll: true });

                        // Restore scroll position first
                        if (mainContainer) {
                            mainContainer.scrollTop = savedScrollTop;
                        }

                        // Then restore cursor position
                        if (savedCursorRange) {
                            try {
                                selection.removeAllRanges();
                                selection.addRange(savedCursorRange);
                            } catch (e) {
                                // Silently fail if restoration doesn't work
                                console.warn('Could not restore cursor position:', e);
                            }
                        }
                    }

                    this.state.isOpen = false;
                    document.removeEventListener('click', this.handleClickOutside, true);
                },


                close() {
                    if (!this.state.isOpen) return;
                    this._restoreEditor();

                    // 2. Clean up any temporary markers.
                    const markerNode = document.getElementById(this.state.cursorMarkerId);
                    if (markerNode) {
                        markerNode.parentNode.removeChild(markerNode);
                    }

                    // 3. Reset all state and UI elements.
                    this.state.isOpen = false;
                    App.state.savedRange = null;
                    this.state.cursorMarkerId = null;

                    // Remove preview pane if exists
                    const previewPane = this.els.palette.querySelector('.nk-command-palette-preview');
                    if (previewPane) previewPane.remove();

                    if (this.els.palette) this.els.palette.style.display = 'none';
                    if (this.els.input) this.els.input.value = '';

                    document.removeEventListener('click', this.handleClickOutside, true);

                    // 4. Return focus to the editor for a seamless experience.
                    const contentDiv = document.getElementById('article-content');
                    if (contentDiv) contentDiv.focus();
                },

                handleKeyDown(e) {
                    if (!this.state.isOpen) return;
                    // FIX: Correct backspace behavior
                    if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
                    if (e.key === 'Backspace' && this.els.input.value === '') { e.preventDefault(); this.close(); return; }
                    if (e.key === '/') { e.preventDefault(); this.exitAndInsertSlash(); return; }

                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (e.key === 'ArrowDown') { this.state.selectedIndex = (this.state.selectedIndex + 1) % this.state.filteredResults.length; }
                        else { this.state.selectedIndex = (this.state.selectedIndex - 1 + this.state.filteredResults.length) % this.state.filteredResults.length; }
                        this.render();
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        this.execute();
                    }
                },
                exitAndInsertSlash() {
                    if (!this.state.isOpen) return;
                    this._restoreEditor();
                    const markerNode = document.getElementById(this.state.cursorMarkerId);
                    if (markerNode) {
                        const slashNode = document.createTextNode('/'); markerNode.parentNode.insertBefore(slashNode, markerNode);
                        const sel = window.getSelection(); const range = document.createRange();
                        range.setStartAfter(slashNode); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); markerNode.parentNode.removeChild(markerNode);
                    }
                    this.close(true);
                },
                handleClickOutside: (e) => {
                    const self = App.commandPalette;
                    if (self.state.isOpen && !self.els.palette.contains(e.target)) {
                        self.close();
                    }
                },
};
