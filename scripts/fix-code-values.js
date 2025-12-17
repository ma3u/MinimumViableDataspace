#!/usr/bin/env node
/**
 * Fix hasCodeValues in health-catalog.ttl to use proper skos:Concept structure
 * per HealthDCAT-AP Release 5 specification (§7.7 code values property)
 * 
 * Before: healthdcatap:hasCodeValues "ICD-10-GM:E11.9" ;
 * After:  healthdcatap:hasCodeValues [
 *           a skos:Concept ;
 *           skos:inScheme [
 *             a skos:ConceptScheme ;
 *             dct:identifier "https://www.wikidata.org/entity/Q15629608"^^xsd:anyURI ;
 *             skos:prefLabel "ICD-10-GM (German Modification)"@en ;
 *             skos:notation "ICD-10-GM"
 *           ] ;
 *           skos:notation "E11.9" ;
 *           skos:prefLabel "ICD-10-GM:E11.9"@en
 *         ] ;
 */

const fs = require('fs');
const path = require('path');

// Coding system schemes based on Wikidata entities
const codingSystemSchemes = {
  'ICD-10': { 
    uri: 'https://www.wikidata.org/entity/Q45127', 
    label: 'International Classification of Diseases, 10th Revision', 
    notation: 'ICD-10' 
  },
  'ICD-10-GM': { 
    uri: 'https://www.wikidata.org/entity/Q15629608', 
    label: 'ICD-10-GM (German Modification)', 
    notation: 'ICD-10-GM' 
  },
  'SNOMED-CT': { 
    uri: 'https://www.wikidata.org/entity/Q744434', 
    label: 'SNOMED Clinical Terms', 
    notation: 'SNOMED-CT' 
  },
  'LOINC': { 
    uri: 'https://www.wikidata.org/entity/Q192093', 
    label: 'Logical Observation Identifiers Names and Codes', 
    notation: 'LOINC' 
  },
  'MedDRA': { 
    uri: 'https://www.wikidata.org/entity/Q1428979', 
    label: 'Medical Dictionary for Regulatory Activities', 
    notation: 'MedDRA' 
  },
  'ATC': { 
    uri: 'https://www.wikidata.org/entity/Q192270', 
    label: 'Anatomical Therapeutic Chemical Classification', 
    notation: 'ATC' 
  },
  'FHIR': { 
    uri: 'https://www.wikidata.org/entity/Q19597236', 
    label: 'Fast Healthcare Interoperability Resources', 
    notation: 'FHIR' 
  },
};

function transformCodeValue(match, codeValue) {
  // Parse code like "ICD-10-GM:E11.9"
  const colonIdx = codeValue.lastIndexOf(':');
  if (colonIdx <= 0) {
    // No prefix found, return simple concept
    return `healthdcatap:hasCodeValues [
    a skos:Concept ;
    dct:identifier "${codeValue}"^^xsd:anyURI ;
    skos:notation "${codeValue}"
  ] ;`;
  }
  
  const systemPrefix = codeValue.substring(0, colonIdx);
  const codeNotation = codeValue.substring(colonIdx + 1);
  
  const scheme = codingSystemSchemes[systemPrefix] || {
    uri: 'https://www.wikidata.org/entity/Q0',
    label: systemPrefix,
    notation: systemPrefix
  };
  
  // Per HealthDCAT-AP SHACL validation:
  // - skos:inScheme must be an IRI (not a blank node)
  // - dct:identifier must be xsd:anyURI
  return `healthdcatap:hasCodeValues [
    a skos:Concept ;
    skos:inScheme <${scheme.uri}> ;
    dct:identifier "${codeValue}"^^xsd:anyURI ;
    skos:notation "${codeNotation}" ;
    skos:prefLabel "${codeValue}"@en
  ] ;`;
}

// Main
const inputPath = path.join(__dirname, '..', 'resources', 'health-catalog.ttl');
const outputPath = inputPath; // Overwrite

console.log(`Reading: ${inputPath}`);
let content = fs.readFileSync(inputPath, 'utf8');

// Pattern to match: healthdcatap:hasCodeValues "CODE:VALUE" ;
const pattern = /healthdcatap:hasCodeValues "([^"]+)" ;/g;

let matchCount = 0;
content = content.replace(pattern, (match, codeValue) => {
  matchCount++;
  return transformCodeValue(match, codeValue);
});

console.log(`Transformed ${matchCount} hasCodeValues entries`);

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Written: ${outputPath}`);
