import { LanguageId } from '../types';

export interface AITeacherScenario {
  id: string;
  title: string;
  titleDe: string;
  category: 'daily' | 'service' | 'travel' | 'work' | 'social' | 'medical';
  icon: string;
  recommendedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  descriptionTr: string;
  roleAi: string;
  roleUser: string;
  initialPrompts: Record<string, {
    text: string;
    translationTr: string;
    phonetic: string;
  }>;
  suggestedHints: Record<string, string[]>;
}

export const AI_TEACHER_SCENARIOS: AITeacherScenario[] = [
  {
    id: 'daily_intro',
    title: 'Günlük Sohbet & Tanışma',
    titleDe: 'Kennenlernen & Begrüßung',
    category: 'social',
    icon: '👋',
    recommendedLevel: 'A1',
    descriptionTr: 'İlk karşılaşmada selamlaşma, isim sorma, nereli olduğunu ve mesleğini söyleme pratiği.',
    roleAi: 'Samimi bir dil öğrenme arkadaşı (Tandem partner)',
    roleUser: 'Yeni tanışan öğrenci',
    initialPrompts: {
      de: {
        text: 'Hallo! Schön dich kennenzulernen. Wie heißt du und woher kommst du?',
        translationTr: 'Merhaba! Tanıştığımıza memnun oldum. Adın ne ve nereden geliyorsun?',
        phonetic: '[hal-lo! şön dih ken-nın-tsu-ler-nın. vi hayst du unt vo-her komst du?]'
      },
      en: {
        text: 'Hello! Nice to meet you. What is your name and where are you from?',
        translationTr: 'Merhaba! Tanıştığımıza memnun oldum. Adın ne ve nerelisin?',
        phonetic: '[he-lo! nays tu mit yu. vat iz yor neym ent ver ar yu fram?]'
      },
      fr: {
        text: 'Bonjour! Enchanté de faire votre connaissance. Comment vous vous appelez?',
        translationTr: 'Merhaba! Tanıştığımıza memnun oldum. Adınız nedir?',
        phonetic: '[bon-jur! an-şan-te dö fer votr ko-ne-sans. ko-man vu vu zap-le?]'
      },
      es: {
        text: '¡Hola! Mucho gusto en conocerte. ¿Cómo te llamas y de dónde eres?',
        translationTr: 'Merhaba! Tanıştığımıza memnun oldum. Adın ne ve nerelisin?',
        phonetic: '[o-la! mu-ço gus-to en ko-no-ser-te. ko-mo te ya-mas i de don-de e-res?]'
      }
    },
    suggestedHints: {
      de: [
        'Ich heiße [Adın] und ich komme aus der Türkei.',
        'Hallo! Mein Name ist [Adın]. Ich lerne seit kurzem Deutsch.',
        'Mir geht es super, danke! Und wie geht es dir?'
      ],
      en: [
        'My name is [Name] and I am from Turkey.',
        'Hello! Nice to meet you too. I am learning English.',
        'I am doing great, thank you! How about you?'
      ]
    }
  },
  {
    id: 'cafe_order',
    title: 'Kafede Sipariş Verme',
    titleDe: 'Bestellung im Café',
    category: 'service',
    icon: '☕',
    recommendedLevel: 'A1',
    descriptionTr: 'Garsonla sipariş verme, içecek seçimi yapma ve kibarca hesap isteme.',
    roleAi: 'Kibar bir kafe garsonu (Kellner)',
    roleUser: 'Kafede oturan müşteri',
    initialPrompts: {
      de: {
        text: 'Guten Tag! Willkommen in unserem Café. Was darf ich Ihnen bringen?',
        translationTr: 'İyi günler! Kafemize hoş geldiniz. Size ne getirebilirim?',
        phonetic: '[gu-tın tag! vil-kom-mın in un-zı-rım ka-fe. vas darf ih i-nın brin-gın?]'
      },
      en: {
        text: 'Good day! Welcome to our cafe. What can I get for you today?',
        translationTr: 'İyi günler! Kafemize hoş geldiniz. Bugün size ne getirebilirim?',
        phonetic: '[gud dey! vel-kam tu aur ka-fey. vat ken ay get for yu tu-dey?]'
      }
    },
    suggestedHints: {
      de: [
        'Ich möchte bitte einen Kaffee mit Milch und Zucker.',
        'Haben Sie auch frischen Apfelkuchen?',
        'Wir möchten gerne bezahlen, bitte. Zusammen oder getrennt?'
      ]
    }
  },
  {
    id: 'restaurant_dinner',
    title: 'Restoranda Akşam Yemeği',
    titleDe: 'Im Restaurant',
    category: 'service',
    icon: '🍽️',
    recommendedLevel: 'A2',
    descriptionTr: 'Masa rezervasyonu, menüden yemek seçimi ve özel istekleri iletme.',
    roleAi: 'Restoran şefi veya garsonu',
    roleUser: 'Akşam yemeğine gelen müşteri',
    initialPrompts: {
      de: {
        text: 'Guten Abend! Haben Sie einen Tisch reserviert oder möchten Sie einen freien Tisch für zwei Personen?',
        translationTr: 'İyi akşamlar! Rezervasyonunuz var mı yoksa iki kişilik boş bir masa mı istersiniz?',
        phonetic: '[gu-tın a-bınt! ha-bın zi ay-nın tiş re-zer-virt o-dır möh-tın zi ay-nın fray-ın tiş?]'
      }
    },
    suggestedHints: {
      de: [
        'Guten Abend! Wir haben keine Reservierung. Haben Sie einen Tisch am Fenster frei?',
        'Was können Sie uns heute als Hauptgericht empfehlen?',
        'Könnten wir bitte die Speisekarte und die Rechnung bekommen?'
      ]
    }
  },
  {
    id: 'supermarket',
    title: 'Süpermarket & Alışveriş',
    titleDe: 'Einkaufen im Supermarkt',
    category: 'daily',
    icon: '🛒',
    recommendedLevel: 'A1',
    descriptionTr: 'Reyonları sorma, ürün fiyatı öğrenme, kilo/gramaj belirtme ve kasada ödeme.',
    roleAi: 'Süpermarket satış görevlisi',
    roleUser: 'Alışveriş yapan müşteri',
    initialPrompts: {
      de: {
        text: 'Hallo! Suchen Sie etwas Bestimmtes? Ich kann Ihnen gerne helfen.',
        translationTr: 'Merhaba! Belirli bir şey mi arıyorsunuz? Size yardımcı olabilirim.',
        phonetic: '[hal-lo! zu-hın zi et-vas be-ştim-tıs? ih kan i-nın ger-nı hel-fın.]'
      }
    },
    suggestedHints: {
      de: [
        'Entschuldigung, wo finde ich frische Milch und Eier?',
        'Wie viel kostet ein Kilo von diesen Tomaten?',
        'Kann ich hier bitte mit Karte bezahlen?'
      ]
    }
  },
  {
    id: 'hotel_checkin',
    title: 'Otelde Giriş & Rezervasyon',
    titleDe: 'Check-in im Hotel',
    category: 'travel',
    icon: '🏨',
    recommendedLevel: 'A2',
    descriptionTr: 'Otel resepsiyonunda giriş yapma, oda anahtarını alma ve kahvaltı saatlerini sorma.',
    roleAi: 'Otel Resepsiyon Görevlisi (Rezeptionist)',
    roleUser: 'Otele yeni varan konuk',
    initialPrompts: {
      de: {
        text: 'Herzlich willkommen im Hotel Glotvia! Haben Sie eine Zimmerreservierung bei uns?',
        translationTr: 'Glotvia Oteli\'ne hoş geldiniz! Bizde oda rezervasyonunuz var mıydı?',
        phonetic: '[herts-lih vil-kom-mın im ho-tel glot-vi-a! ha-bın zi ay-nı tsim-mır-re-zer-vi-rung?]'
      }
    },
    suggestedHints: {
      de: [
        'Ja, ich habe ein Doppelzimmer auf den Namen Ufuk reserviert.',
        'Um wie viel Uhr gibt es morgens Frühstück?',
        'Gibt es im Zimmer kostenloses WLAN und einen Safe?'
      ]
    }
  },
  {
    id: 'airport_travel',
    title: 'Havaalanında & Pasaport Kontrolü',
    titleDe: 'Am Flughafen & Passkontrolle',
    category: 'travel',
    icon: '✈️',
    recommendedLevel: 'A2',
    descriptionTr: 'Check-in masasında biniş kartı alma, bagaj teslimi ve uçuş kapısını öğrenme.',
    roleAi: 'Havaalanı görevlisi (Flughafenpersonal)',
    roleUser: 'Uçağa binecek yolcu',
    initialPrompts: {
      de: {
        text: 'Guten Tag! Bitte Ihren Reisepass und das Flugticket. Fliegen Sie nach Frankfurt?',
        translationTr: 'İyi günler! Pasaportunuzu ve uçak biletinizi alabilir miyim lütfen. Frankfurt\'a mı uçuyorsunuz?',
        phonetic: '[gu-tın tag! bit-tı i-rın ray-zı-pas unt das fluk-ti-kıt. fli-gın zi nah frank-furt?]'
      }
    },
    suggestedHints: {
      de: [
        'Ja genau. Hier sind mein Pass und mein Ticket.',
        'Ich habe einen Koffer zum Aufgeben und ein Handgepäck.',
        'An welchem Gate startet der Flug und wann ist das Boarding?'
      ]
    }
  },
  {
    id: 'doctor_clinic',
    title: 'Doktorda Randevu & Şikayet',
    titleDe: 'Beim Arzt & in der Praxis',
    category: 'medical',
    icon: '🩺',
    recommendedLevel: 'A2',
    descriptionTr: 'Rahatsızlığı anlatma, ağrıyan yeri belirtme ve doktorun reçete tavsiyelerini anlama.',
    roleAi: 'Uzman Doktor (Arzt / Ärztin)',
    roleUser: 'Muayeneye gelen hasta',
    initialPrompts: {
      de: {
        text: 'Guten Tag! Nehmen Sie bitte Platz. Was fehlt Ihnen denn? Welche Beschwerden haben Sie?',
        translationTr: 'İyi günler! Lütfen oturun. Neyiniz var? Ne gibi şikayetleriniz bulunuyor?',
        phonetic: '[gu-tın tag! ne-mın zi bit-tı plats. vas felt i-nın den? vel-hı be-şver-dın ha-bın zi?]'
      }
    },
    suggestedHints: {
      de: [
        'Seit zwei Tagen habe ich starke Kopfschmerzen und Halsschmerzen.',
        'Ich fühle mich schwach und habe auch leichtes Fieber.',
        'Muss ich diese Medikamente vor oder nach dem Essen einnehmen?'
      ]
    }
  },
  {
    id: 'job_interview',
    title: 'İş Görüşmesi & Mülakat',
    titleDe: 'Das Vorstellungsgespräch',
    category: 'work',
    icon: '💼',
    recommendedLevel: 'B1',
    descriptionTr: 'Kendini ve kariyer geçmişini tanıtma, güçlü yönlerini ve hedeflerini ifade etme.',
    roleAi: 'İnsan Kaynakları Müdürü (Personalchef)',
    roleUser: 'İş başvurusunda bulunan aday',
    initialPrompts: {
      de: {
        text: 'Guten Tag! Schön, dass Sie da sind. Bitte erzählen Sie mir kurz etwas über Ihren beruflichen Werdegang.',
        translationTr: 'İyi günler! Hoş geldiniz. Lütfen bana mesleki geçmişinizden kısaca bahseder misiniz?',
        phonetic: '[gu-tın tag! şön, das zi da zint. bit-tı er-tseh-lın zi mir kurts et-vas ü-bır i-rın be-ruf-li-hın ver-dı-gang.]'
      }
    },
    suggestedHints: {
      de: [
        'Ich habe mehrere Jahre Erfahrung im Bereich Software und Projektmanagement.',
        'Meine größten Stärken sind Teamfähigkeit, Zuverlässigkeit und schnelles Lernen.',
        'Warum diese Stelle perfekt zu meinen Fähigkeiten passt...'
      ]
    }
  },
  {
    id: 'friends_weekend',
    title: 'Arkadaşla Hafta Sonu Planı',
    titleDe: 'Wochenendpläne mit Freunden',
    category: 'social',
    icon: '🎉',
    recommendedLevel: 'A2',
    descriptionTr: 'Hafta sonu sinema, konser veya gezi planı yapma, buluşma saati ve yeri kararlaştırma.',
    roleAi: 'Yakın arkadaş (Guter Freund)',
    roleUser: 'Arkadaşıyla konuşan öğrenci',
    initialPrompts: {
      de: {
        text: 'Hey! Was machst du am Wochenende? Hast du Lust, zusammen ins Kino oder in den Park zu gehen?',
        translationTr: 'Hey! Hafta sonu ne yapıyorsun? Birlikte sinemaya veya parka gitmek ister misin?',
        phonetic: '[hey! vas mahst du am voh-ın-en-dı? hast du lust, tsu-zam-mın ins ki-no o-dır in den park tsu ge-hın?]'
      }
    },
    suggestedHints: {
      de: [
        'Das klingt super! Am Samstag habe ich Zeit. Um wie viel Uhr treffen wir uns?',
        'Ich würde gerne den neuen Film sehen. Treffen wir uns vor dem Kino?',
        'Perfekt, ich bringe auch noch ein paar Snacks mit.'
      ]
    }
  },
  {
    id: 'phone_call',
    title: 'Telefon Görüşmesi & Randevu',
    titleDe: 'Ein Telefongespräch',
    category: 'service',
    icon: '📞',
    recommendedLevel: 'A2',
    descriptionTr: 'Telefonda kendini tanıtma, randevu saati belirleme ve mesaj bırakma.',
    roleAi: 'Danışma görevlisi (Empfangskraft)',
    roleUser: 'Telefon eden arayan kişi',
    initialPrompts: {
      de: {
        text: 'Praxis Dr. Schmidt, Müller am Apparat. Was kann ich für Sie tun?',
        translationTr: 'Dr. Schmidt Muayenehanesi, telefonda Müller. Size nasıl yardımcı olabilirim?',
        phonetic: '[prak-sis dok-tor şmit, mül-lır am ap-pa-rat. vas kan ih für zi tun?]'
      }
    },
    suggestedHints: {
      de: [
        'Guten Tag, mein Name ist Ufuk. Ich möchte bitte einen Termin vereinbaren.',
        'Hätten Sie nächsten Dienstag um 10 Uhr einen Termin frei?',
        'Vielen Dank für die Information. Auf Wiederhören!'
      ]
    }
  },
  {
    id: 'office_workplace',
    title: 'İş Yerinde & Ofiste İletişim',
    titleDe: 'Kommunikation am Arbeitsplatz',
    category: 'work',
    icon: '🏢',
    recommendedLevel: 'B1',
    descriptionTr: 'İş arkadaşlarıyla proje durumu konuşma, toplantı ayarlama ve görev dağılımı.',
    roleAi: 'Proje Yöneticisi / İş Arkadaşı',
    roleUser: 'Şirket çalışanı',
    initialPrompts: {
      de: {
        text: 'Hallo! Hast du kurz Zeit? Wir müssen das Feedback für das neue Projekt besprechen.',
        translationTr: 'Merhaba! Kısa bir vaktin var mı? Yeni proje ile ilgili geri bildirimleri görüşmemiz gerekiyor.',
        phonetic: '[hal-lo! hast du kurts tsayt? vir müs-sın das fit-bek für das noy-ı pro-yekt be-şpre-hın.]'
      }
    },
    suggestedHints: {
      de: [
        'Ja sicher, ich habe meinen Bericht fast fertig. Lass uns die Punkte durchgehen.',
        'Wann ist die Deadline für die finale Präsentation?',
        'Ich kann diesen Teil der Aufgabe gerne bis morgen übernehmen.'
      ]
    }
  },
  {
    id: 'train_navigation',
    title: 'Trende & Yol Tarifi Sorma',
    titleDe: 'Am Bahnhof & nach dem Weg fragen',
    category: 'travel',
    icon: '🚆',
    recommendedLevel: 'A1',
    descriptionTr: 'Garda peron öğrenme, bilet alma, aktarma sorma ve şehirde yön bulma.',
    roleAi: 'Gar görevlisi veya yoldan geçen yerli',
    roleUser: 'Yolunu arayan gezgin',
    initialPrompts: {
      de: {
        text: 'Entschuldigung, kann ich Ihnen helfen? Suchen Sie das richtige Gleis?',
        translationTr: 'Affedersiniz, yardımcı olabilir miyim? Doğru peronu mu arıyorsunuz?',
        phonetic: '[ent-şul-di-gung, kan ih i-nın hel-fın? zu-hın zi das rih-ti-gı glays?]'
      }
    },
    suggestedHints: {
      de: [
        'Ja bitte! Von welchem Gleis fährt der ICE nach Berlin ab?',
        'Wie komme ich von hier am schnellsten zum Brandenburger Tor?',
        'Muss ich unterwegs umsteigen oder fährt der Zug direkt?'
      ]
    }
  },
  {
    id: 'berlin_life',
    title: 'Berlin\'de Günlük Hayat & Kültür',
    titleDe: 'Alltag in Berlin & Kultur',
    category: 'social',
    icon: '🏛️',
    recommendedLevel: 'B1',
    descriptionTr: 'Almanya\'daki yaşam, mahalleler, müzeler, sokak lezzetleri ve Alman kültürü üzerine sohbet.',
    roleAi: 'Berlinli kültür rehberi & yerel sakin',
    roleUser: 'Berlin\'i keşfeden dil öğrencisi',
    initialPrompts: {
      de: {
        text: 'Willkommen in Berlin! Welche Stadtteile und Sehenswürdigkeiten möchtest du heute entdecken?',
        translationTr: 'Berlin\'e hoş geldin! Bugün hangi semtleri ve tarihi yerleri keşfetmek istersin?',
        phonetic: '[vil-kom-mın in ber-lin! vel-hı ştat-tay-lı unt ze-ıns-vür-dih-kay-tın möh-tist du hoy-tı ent-dek-kın?]'
      }
    },
    suggestedHints: {
      de: [
        'Ich möchte unbedingt das Museum Island und die Berliner Mauer besichtigen.',
        'Welches Café in Kreuzberg oder Mitte kannst du mir empfehlen?',
        'Wie funktioniert das Ticket-System für die Berliner U-Bahn und S-Bahn?'
      ]
    }
  },
  {
    id: 'apartment_renting',
    title: 'Daire Kiralama & Ev Sahibiyle Görüşme',
    titleDe: 'Wohnungssuche & Besichtigung',
    category: 'daily',
    icon: '🔑',
    recommendedLevel: 'B1',
    descriptionTr: 'Ev ilanı hakkında soru sorma, kira ve depozito (Kaution) şartlarını öğrenme.',
    roleAi: 'Ev Sahibi (Vermieter / Vermieterin)',
    roleUser: 'Kiralık ev arayan kiracı adayı',
    initialPrompts: {
      de: {
        text: 'Guten Tag! Willkommen zur Wohnungsbesichtigung. Haben Sie Fragen zu den Nebenkosten oder zur Kaution?',
        translationTr: 'İyi günler! Daire gezinize hoş geldiniz. Yan giderler veya depozito ile ilgili bir sorunuz var mı?',
        phonetic: '[gu-tın tag! vil-kom-mın tsur voh-nungs-be-zih-ti-gung. ha-bın zi fra-gın tsu den ne-bın-kos-tın?]'
      }
    },
    suggestedHints: {
      de: [
        'Wie hoch ist die Warmmiete inklusive Heizung und Strom?',
        'Ab wann ist die Wohnung bezugsfrei?',
        'Sind Haustiere in dieser Wohnung erlaubt?'
      ]
    }
  }
];
