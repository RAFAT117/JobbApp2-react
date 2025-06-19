import { JobAd, UserDocuments } from '../types';

export function generateWebFormResponses(job: JobAd, documents: UserDocuments) {
  return `1. Varför söker du detta jobb?
Jag söker detta jobb eftersom jag är intresserad av ${job.employer.name} och deras verksamhet. Positionen som ${job.headline} passar perfekt med mina erfarenheter och karriärmål.

2. Vilka relevanta erfarenheter har du?
Jag har relevant erfarenhet från min tidigare anställning där jag arbetat med liknande uppgifter. Mina färdigheter inom området gör mig väl rustad för denna roll.

3. Vilka är dina styrkor?
Mina främsta styrkor är min förmåga att arbeta självständigt och i team, min problemlösningsförmåga och min kommunikationsförmåga. Jag är också mycket organiserad och har en stark arbetsmoral.

4. Varför skulle du passa för denna roll?
Jag tror att jag skulle passa utmärkt för denna roll eftersom mina erfarenheter och färdigheter matchar de krav som ställs. Jag är motiverad att utvecklas och bidra till företagets framgång.

5. Vilka är dina karriärmål?
Mina karriärmål är att fortsätta utvecklas professionellt och ta på mig mer ansvar över tid. Jag ser fram emot möjligheten att växa inom ${job.employer.name} och bidra till företagets framgång.`;
}

export function generateApplicationEmail(job: JobAd, documents: UserDocuments) {
  return `Hej,

Jag heter [DITT NAMN] och jag söker positionen som ${job.headline} hos ${job.employer.name}.

Jag är mycket intresserad av denna roll eftersom den passar perfekt med mina erfarenheter och karriärmål. Mina färdigheter inom området gör mig väl rustad för denna position.

Jag har bifogat mitt CV och personliga brev för din granskning. Jag ser fram emot möjligheten att diskutera hur jag kan bidra till ${job.employer.name}.

Med vänliga hälsningar,
[DITT NAMN]`;
}

export function analyzeJobMatch(job: JobAd, documents: UserDocuments) {
  return `Matchningsanalys:

Matchningspoäng: 85/100

Styrkor i ansökan:
- Relevanta erfarenheter
- Bra kommunikationsförmåga
- Stark motivation

Förbättringsområden:
- Mer specifika exempel på tidigare prestationer
- Tydligare koppling till företagets värderingar

Rekommendationer:
1. Anpassa ansökan mer specifikt till ${job.employer.name}
2. Inkludera fler konkreta exempel på tidigare framgångar
3. Koppla dina färdigheter tydligare till jobbets krav`;
} 