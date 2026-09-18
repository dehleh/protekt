import type { Verdict } from './scam-engine';

export type SupportedLanguage = 'English' | 'Pidgin assist' | 'Hausa' | 'Yoruba' | 'Igbo';

export type VernacularGuidance = {
  label: string;
  badge: string;
  advice: string;
  speechText: string;
  actionTips: string[];
};

export const LANGUAGES: { id: SupportedLanguage; label: string; nativeName: string }[] = [
  { id: 'English', label: 'English', nativeName: 'English' },
  { id: 'Pidgin assist', label: 'Pidgin', nativeName: 'Naija Pidgin' },
  { id: 'Hausa', label: 'Hausa', nativeName: 'Harshen Hausa' },
  { id: 'Yoruba', label: 'Yoruba', nativeName: 'Èdè Yorùbá' },
  { id: 'Igbo', label: 'Igbo', nativeName: 'Asụsụ Igbo' },
];

export const VERNACULAR_GUIDANCE: Record<SupportedLanguage, Record<Verdict, VernacularGuidance>> = {
  English: {
    'likely-scam': {
      label: 'Strong warning signs found',
      badge: 'High Risk',
      advice: 'Strong warning signs were found. Do not transfer funds, share OTPs, PINs, BVN, or NIN. Verify independently with official providers.',
      speechText: 'Warning. High risk signs detected. Do not send money, OTP, PIN, or sensitive bank details. Verify independently before acting.',
      actionTips: [
        'Never share verification codes (OTP) or banking credentials.',
        'Call the sender on an independently verified telephone number.',
        'If you already paid or clicked, start Cyber SOS immediately.',
      ],
    },
    suspicious: {
      label: 'Take a closer look',
      badge: 'Caution',
      advice: 'Something here needs independent verification. A warning sign is not proof of fraud, but extra caution is required before paying or clicking.',
      speechText: 'Caution. Suspicious patterns found. Pause and verify the sender before taking any action or clicking links.',
      actionTips: [
        'Check the sender URL or account number directly in your banking app.',
        'Avoid making rushed decisions driven by deadlines or urgency.',
      ],
    },
    uncertain: {
      label: 'More context needed',
      badge: 'Uncertain',
      advice: 'There is not enough information to assess this request safely. Always verify independently through trusted contacts.',
      speechText: 'Notice. Not enough context to assess safely. Please check the website or sender independently.',
      actionTips: [
        'Paste the full message or inspect the link carefully.',
        'Do not assume a message is safe simply because no warnings were triggered.',
      ],
    },
    'no-signals': {
      label: 'No clear warning signs found',
      badge: 'No Warning',
      advice: 'The available pattern checks did not trigger a warning. This does not guarantee that the sender or offer is legitimate.',
      speechText: 'No obvious warning signs detected. However, safety is not guaranteed. Remain vigilant before sending money.',
      actionTips: [
        'Always confirm beneficiary identities before sending money.',
        'Legitimate companies will not request your passwords or PINs.',
      ],
    },
  },
  'Pidgin assist': {
    'likely-scam': {
      label: 'Dis one na serious warning',
      badge: 'High Risk',
      advice: 'Dis message get serious scam signs. No send money, OTP, PIN, BVN or NIN at all! Call the person or bank wit real number wey you already get.',
      speechText: 'Warning o! Dis one get serious scam signs. No send money, OTP, PIN, BVN or NIN. Pause well-well before you do anything.',
      actionTips: [
        'No ever share your 6-digit OTP or ATM PIN with anybody.',
        'No follow rush-rush pay money into stranger account.',
        'If you don pay already, open Cyber SOS right now make we help you.',
      ],
    },
    suspicious: {
      label: 'Hold on first make you check',
      badge: 'Caution',
      advice: 'Something dey fishy for here. E fit be scam, e fit be real, but make you pause first confirm am before you click or pay.',
      speechText: 'Hold on first! Something dey fishy for dis message. No rush send money until you confirm am well.',
      actionTips: [
        'Check your bank app directly to see whether true-true alert land.',
        'No allow anybody rush you say time dey go or account go block.',
      ],
    },
    uncertain: {
      label: 'We need more information',
      badge: 'Uncertain',
      advice: 'We no fit talk true whether e good or bad from only dis small text. Make you check am well by yourself.',
      speechText: 'We need more information. Dis small text no reach to judge. Shine your eye confirm am yourself.',
      actionTips: [
        'Paste the complete message or link make we re-check am.',
        'No assume say link safe just because e fine.',
      ],
    },
    'no-signals': {
      label: 'We no see clear danger sign',
      badge: 'Check First',
      advice: 'We no see obvious scam pattern for here, but dat one no mean say everything 100% safe. Always shine your eye before you transfer.',
      speechText: 'We no see clear scam pattern, but dat one no mean say e 100 percent safe. Shine your eye before you transfer.',
      actionTips: [
        'Confirm who dey receive the money before you press send.',
        'Real bank no go ever ask you for your login password.',
      ],
    },
  },
  Hausa: {
    'likely-scam': {
      label: 'Akwai babbar alamar hadari ta zamba',
      badge: 'Hadari Sosai',
      advice: 'An gano alamun zamba masu karfi. Kada ka tura kudi, ko lambar sirri ta OTP, PIN, BVN ko NIN. Tuntubi banki ko hukuma ta hanyar da kake da tabbaci a kanta.',
      speechText: 'Gargadi. An gano alamun hadari sosai. Kada ka tura kudi ko lambar sirri ta banki. Tabbatar da gaskiyar lamarin tukuna.',
      actionTips: [
        'Kada ka taba raba lambobin OTP ko PIN na katin cirar kudi da kowa.',
        'Tuntubi wanda ya aiko da sakon ta hanyar lambar wayar da ka sani.',
        'Idan har ka riga ka tura kudi, bude shafin Cyber SOS nan take.',
      ],
    },
    suspicious: {
      label: 'Dakatar da kanka ka duba da kyau',
      badge: 'Tuhuma',
      advice: 'Akwai abubuwan tuhuma a cikin wannan sakon. Kada ka gaggauta danna mahada ko tura kudi har sai ka bincika da kanka.',
      speechText: 'Tuhuma. Akwai abubuwan shakku a cikin wannan sakon. Dakata ka bincika kafin ka tura kudi.',
      actionTips: [
        'Bincika asusun a cikin manhajar bankinka ta gaskiya.',
        'Kada ka bari wani ya firgita ka da batun cewa asusunka zai toshe.',
      ],
    },
    uncertain: {
      label: 'Ana bukatar karin bayani',
      badge: 'Ba Tabbas',
      advice: 'Babu isassun shaidu don tabbatar da wannan sakon. Bincika da kanka ta hanyoyin da ka amince da su.',
      speechText: 'Babu isassun bayanai don tabbatar da lafiyar wannan sakon. Yi bincike da kanka.',
      actionTips: [
        'Sanya cikakken sakon ko mahadar don sake dubawa.',
        'Kada ka dauka cewa sakon yana da aminci kawai don ba a ga gargadi ba.',
      ],
    },
    'no-signals': {
      label: 'Ba a gano wata alamar hadari ba',
      badge: 'Babu Alama',
      advice: 'Bincikenmu bai nuna wata alamar hadari a fili ba, amma wannan ba tabbacin cewa komai yana da aminci 100% ba ne. Yi taka tsantsan koyaushe.',
      speechText: 'Ba a gano wata alamar hadari ba a yanzu, amma wannan ba tabbacin aminci ba ne. Yi taka tsantsan.',
      actionTips: [
        'Tabbatar da sunan mai karbar kudi kafin ka tura.',
        'Hukumomin banki na gaskiya ba za su taba neman lambobin sirrinka ba.',
      ],
    },
  },
  Yoruba: {
    'likely-scam': {
      label: 'Aami ewu gidi wa nibi',
      badge: 'Ewu Púpọ̀',
      advice: 'A ri awọn ami ewu to lagbara ninu ifiranṣẹ yii. Ma ṣe fi owo ranṣẹ, tabi pin koodu aṣiri OTP, PIN, BVN tabi NIN. Pe eniyan tabi ile-ifowopamọ naa lori nọmba ti o mọ tẹlẹ.',
      speechText: 'Ikilo o! Aami ewu gidi wa nibi. Ma ṣe fi owo tabi koodu aṣiri ranṣẹ rara. Ṣayẹwo daradara ki o to ṣe ohunkohun.',
      actionTips: [
        'Ma ṣe fi koodu aṣiri OTP tabi PIN kọmputa rẹ han ẹnikẹni.',
        'Ma ṣe gbọ ipe ikanju lati fi owo ranṣẹ si akọọlẹ ti o ko mọ.',
        'Ti o ba ti sanwo tẹlẹ, tẹ Cyber SOS lẹsẹkẹsẹ fun iranlọwọ.',
      ],
    },
    suspicious: {
      label: 'Duro na ki o ṣayẹwo daadaa',
      badge: 'Ifura',
      advice: 'Nnkan kan jọ ifura nibi. Ṣe ayẹwo rẹ daradara ki o to tẹ ọna asopọ eyikeyi tabi gbe igbesẹ sisanwo.',
      speechText: 'Ifura wa nibi o. Duro na ki o ṣayẹwo daadaa ki o to tẹ ọna asopọ tabi fi owo ranṣẹ.',
      actionTips: [
        'Ṣayẹwo akọọlẹ naa taara ninu ohun elo banki rẹ.',
        'Ma ṣe jẹ ki iberu pe akọọlẹ rẹ yoo di tii mu ki o yara gbe igbesẹ ti ko tọ.',
      ],
    },
    uncertain: {
      label: 'A nilo alaye siwaju sii',
      badge: 'Ko Daju',
      advice: 'Kò si alaye to to lati mọ boya o dara tabi ko dara. Rii daju pe o fi idi rẹ mulẹ pẹlu awọn orisun ti o gbẹkẹle.',
      speechText: 'Alaye ko to lati ṣe idajọ eleyi. Ṣe ayẹwo rẹ lẹẹkan si pẹlu orisun to daju.',
      actionTips: [
        'Fi gbogbo ifiranṣẹ naa tabi ọna asopọ pipe ranṣẹ lati ṣayẹwo rẹ.',
        'Ma ṣe ro pe o ni aabo nitori pe a ko ri aami ikilọ.',
      ],
    },
    'no-signals': {
      label: 'A ko ri ami ewu kankan',
      badge: 'Ṣọra Sibẹ',
      advice: 'Ayẹwo wa ko ri aami ewu eyikeyi, ṣugbọn eyi ko tumọ si pe ko si ewu rara. Ṣọra gidigidi nigbagbogbo ki o to fi alaye rẹ ranṣẹ.',
      speechText: 'A ko ri ami ewu kankan ninu eyi, ṣugbọn ṣọra gidigidi ki o to fi owo tabi alaye ranṣẹ.',
      actionTips: [
        'Rii daju orukọ ẹni ti o fẹ gba owo naa ki o to tẹ firanṣẹ.',
        'Ile-ifowopamọ tootọ kii yoo beere fun ọrọ aṣiri tabi PIN rẹ laelae.',
      ],
    },
  },
  Igbo: {
    'likely-scam': {
      label: 'Enwere nnukwu ihe ize ndụ wayo',
      badge: 'Ihe Ize Ndụ',
      advice: 'Ahụrụ ihe ịrịba ama siri ike nke wayo. Ezipụla ego, ma ọ bụ koodu nzuzo OTP, PIN, BVN ma ọ bụ NIN. Kpọọ onye ahụ ma ọ bụ ụlọ akụ na nọmba ịtụkwasịrị obi.',
      speechText: 'Ịdọ aka na ntị. Enwere nnukwu ihe ize ndụ wayo ebe a. Ezipụla ego ma ọ bụ koodu nzuzo ọ bụla. Nyochaa nke ọma ugbu a.',
      actionTips: [
        'Ekwela ka onye ọ bụla mara koodu OTP ma ọ bụ PIN ụlọ akụ gị.',
        'Ejila ọsọ ziga ego na akaụntụ ị na-amaghị nke ọma.',
        'Ọ bụrụ na ị zigala ego, mepee Cyber SOS ozugbo maka enyemaka.',
      ],
    },
    suspicious: {
      label: 'Chere obere ma nyochaa ya',
      badge: 'Enwere Eniyo',
      advice: 'Enwere ihe na-enyo enyo n’ozi a. Nyochaa ya nke ọma tupu ị pịa njikọ ma ọ bụ ziga ego ọ bụla.',
      speechText: 'Ihe enyo enyo dị ebe a. Chere obere ma nyochaa ya tupu ị ziga ego ma ọ bụ pịa njikọ.',
      actionTips: [
        'Lelee akaụntụ ahụ ozugbo n’ime ngwa ụlọ akụ gị iji hụ eziokwu.',
        'Ekwela ka egwu na akaụntụ gị ga-emechi mee ka ị mee ngwa ngwa.',
      ],
    },
    uncertain: {
      label: 'Achọrọ nkọwa ndị ọzọ',
      badge: 'Ejighị Naka',
      advice: 'Enweghị ozi zuru ezu iji kpee ozi a ikpe. Jiri aka gị nyochaa ya site na ụzọ ị maara nke ọma.',
      speechText: 'Ozi ezughi oke iji mara ma ọ dị mma. Biko jiri aka gị nyochaa ya nke ọma.',
      actionTips: [
        'Tinyechaa ozi ahụ niile ma ọ bụ njikọ zuru oke ka anyị nyochaa ya ọzọ.',
        'Echela na ọ dị mma naanị n’ihi na ahụghị ịdọ aka ná ntị.',
      ],
    },
    'no-signals': {
      label: 'Ahụghị ihe ize ndụ ọ bụla doro anya',
      badge: 'Kpachara Anya',
      advice: 'Nnyocha anyị ahụghị ụdị wayo doro anya, mana nke ahụ apụtaghị na ọ nweghị ihe ize ndụ ma ọlị. Kpachara anya mgbe niile tupu ị ziga ego.',
      speechText: 'Ahụghị ihe ize ndụ doro anya ugbu a, mana kpachara anya mgbe niile tupu ị ziga ego ma ọ bụ ozi.',
      actionTips: [
        'Gbaa mbọ mara onye ị na-ezigara ego tupu ị pịa ziga.',
        'Ezi ụlọ akụ agaghị ajụ gị paswọọdụ ma ọ bụ koodu PIN gị mgbe ọ bụla.',
      ],
    },
  },
};
