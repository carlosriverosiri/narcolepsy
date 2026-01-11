import React, { useState } from 'react';
import { Info, Bug, FlaskConical, Trash2, Dna, AlertTriangle, Shield, CircleDot, MapPin } from 'lucide-react';

// --- Data Definitions ---

type ViewMode = 'synthesis' | 'degradation' | 'pathogens' | 'viruses' | 'storage' | 'autoimmune' | 'tumors' | 'genetics';

const SERIES_COLORS = {
  precursor: "bg-gray-200 border-gray-400 text-gray-800",
  o: "bg-slate-100 border-slate-300 text-slate-700", // 0-series
  a: "bg-blue-100 border-blue-300 text-blue-800",     // a-series
  b: "bg-red-100 border-red-300 text-red-800",       // b-series
  c: "bg-green-100 border-green-300 text-green-800"   // c-series
};

const ENZYME_COLORS = {
  synthase: "bg-emerald-600 text-white hover:bg-emerald-700",
  catabolic: "bg-rose-600 text-white hover:bg-rose-700",
  key_enzyme: "bg-amber-500 text-white hover:bg-amber-600"
};

// Key enzymes that are highlighted (related to hypothesis)
const KEY_ENZYMES = ['B3GALT4']; // B3GALT4 is in HLA region (6p21.32)

// Simplified map of the ganglioside grid
const GRID_NODES = [
  // Level 0: Precursors
  { id: 'cer', label: 'Ceramide', series: 'precursor', row: 0, col: 0, colSpan: 4 },
  { id: 'glccer', label: 'GlcCer', series: 'precursor', row: 1, col: 0, colSpan: 4 },
  { id: 'laccer', label: 'LacCer', series: 'precursor', row: 2, col: 0, colSpan: 4 },
  
  // Level 1: Initiation of series
  { id: 'ga2', label: 'GA2', series: 'o', row: 3, col: 0 },
  { id: 'gm3', label: 'GM3', series: 'a', row: 3, col: 1 },
  { id: 'gd3', label: 'GD3', series: 'b', row: 3, col: 2 },
  { id: 'gt3', label: 'GT3', series: 'c', row: 3, col: 3 },

  // Level 2: Extension
  { id: 'ga1', label: 'GA1', series: 'o', row: 4, col: 0 },
  { id: 'gm2', label: 'GM2', series: 'a', row: 4, col: 1 },
  { id: 'gd2', label: 'GD2', series: 'b', row: 4, col: 2 },
  { id: 'gt2', label: 'GT2', series: 'c', row: 4, col: 3 },

  // Level 3: Further extension (B3GALT4 products - in HLA region!)
  { id: 'gm1b', label: 'GM1b', series: 'o', row: 5, col: 0 },
  { id: 'gm1a', label: 'GM1a', series: 'a', row: 5, col: 1 },
  { id: 'gd1b', label: 'GD1b', series: 'b', row: 5, col: 2, keyStep: true },
  { id: 'gt1c', label: 'GT1c', series: 'c', row: 5, col: 3 },

  // Level 4: Terminal sialylation (simplified)
  { id: 'gd1c', label: 'GD1c', series: 'o', row: 6, col: 0 },
  { id: 'gd1a', label: 'GD1a', series: 'a', row: 6, col: 1 },
  { id: 'gt1b', label: 'GT1b', series: 'b', row: 6, col: 2, highlight: true },
  { id: 'gq1c', label: 'GQ1c', series: 'c', row: 6, col: 3 },
];

// Connectivity data for metabolic pathways
const PATHWAYS = [
  // --- SYNTHESIS (Anabolism) ---
  { from: 'cer', to: 'glccer', type: 'vertical', mode: 'synthesis', enzyme: 'UGCG', name: 'Ceramide Glucosyltransferase' },
  { from: 'glccer', to: 'laccer', type: 'vertical', mode: 'synthesis', enzyme: 'B4GALT6', name: 'LacCer Synthase' },
  { from: 'laccer', to: 'ga2', type: 'vertical', mode: 'synthesis', enzyme: 'B4GALNT1', name: 'GM2/GD2 Synthase' }, 
  { from: 'laccer', to: 'gm3', type: 'right-branch', mode: 'synthesis', enzyme: 'ST3GAL5', name: 'GM3 Synthase' }, 
  { from: 'gm3', to: 'gd3', type: 'horizontal', mode: 'synthesis', enzyme: 'ST8SIA1', name: 'GD3 Synthase' },
  { from: 'gd3', to: 'gt3', type: 'horizontal', mode: 'synthesis', enzyme: 'ST8SIA5', name: 'GT3 Synthase' },
  { from: 'gm3', to: 'gm2', type: 'vertical', mode: 'synthesis', enzyme: 'B4GALNT1', name: 'GM2/GD2 Synthase' },
  { from: 'gd3', to: 'gd2', type: 'vertical', mode: 'synthesis', enzyme: 'B4GALNT1', name: 'GM2/GD2 Synthase' },
  { from: 'gt3', to: 'gt2', type: 'vertical', mode: 'synthesis', enzyme: 'B4GALNT1', name: 'GM2/GD2 Synthase' },
  { from: 'ga2', to: 'ga1', type: 'vertical', mode: 'synthesis', enzyme: 'B3GALT4', name: 'GM1/GD1b Synthase' },
  { from: 'gm2', to: 'gm1a', type: 'vertical', mode: 'synthesis', enzyme: 'B3GALT4', name: 'GM1/GD1b Synthase' },
  { from: 'gd2', to: 'gd1b', type: 'vertical', mode: 'synthesis', enzyme: 'B3GALT4', name: 'GM1/GD1b Synthase' },
  { from: 'gt2', to: 'gt1c', type: 'vertical', mode: 'synthesis', enzyme: 'B3GALT4', name: 'GM1/GD1b Synthase' },
  { from: 'ga1', to: 'gm1b', type: 'vertical', mode: 'synthesis', enzyme: 'ST3GAL2', name: 'GD1a/GT1b Synthase' },
  { from: 'gm1a', to: 'gd1a', type: 'vertical', mode: 'synthesis', enzyme: 'ST3GAL2', name: 'GD1a/GT1b Synthase' },
  { from: 'gd1b', to: 'gt1b', type: 'vertical', mode: 'synthesis', enzyme: 'ST3GAL2', name: 'GD1a/GT1b Synthase' },
  { from: 'gt1c', to: 'gq1c', type: 'vertical', mode: 'synthesis', enzyme: 'ST3GAL2', name: 'GD1a/GT1b Synthase' },

  // --- DEGRADATION (Catabolism) ---
  { from: 'gd1a', to: 'gm1a', type: 'vertical-up', mode: 'degradation', enzyme: 'NEU1-4', name: 'Sialidase (Neuraminidase)' },
  { from: 'gt1b', to: 'gd1b', type: 'vertical-up', mode: 'degradation', enzyme: 'NEU1-4', name: 'Sialidase (Neuraminidase)' },
  { from: 'gm1a', to: 'gm2', type: 'vertical-up', mode: 'degradation', enzyme: 'GLB1', name: 'β-Galactosidase (GM1 gangliosidosis)' },
  { from: 'gd1b', to: 'gd2', type: 'vertical-up', mode: 'degradation', enzyme: 'GLB1', name: 'β-Galactosidase' },
  { from: 'gm2', to: 'gm3', type: 'vertical-up', mode: 'degradation', enzyme: 'HEXA', name: 'β-Hexosaminidase A (Tay-Sachs)' },
  { from: 'gd2', to: 'gd3', type: 'vertical-up', mode: 'degradation', enzyme: 'HEXA/B', name: 'β-Hexosaminidase A/B (Sandhoff)' },
  { from: 'gd3', to: 'gm3', type: 'horizontal-back', mode: 'degradation', enzyme: 'NEU', name: 'Sialidase' },
  { from: 'gm3', to: 'laccer', type: 'right-branch-back', mode: 'degradation', enzyme: 'NEU', name: 'Sialidase' },
  { from: 'laccer', to: 'glccer', type: 'vertical-up', mode: 'degradation', enzyme: 'GLB1/GALC', name: 'β-Galactosidase / Galactosylceramidase' },
  { from: 'glccer', to: 'cer', type: 'vertical-up', mode: 'degradation', enzyme: 'GBA', name: 'Glucocerebrosidase (Gaucher)' },
];

// Bacterial toxins and their ganglioside targets
const PATHOGEN_BINDINGS = [
  // Bacterial toxins
  { 
    target: 'gm1a', 
    pathogen: 'Cholera toxin',
    organism: 'Vibrio cholerae',
    affinity: 'high',
    disease: 'Cholera',
    notes: 'Primary receptor. Kd ≈ 4.6 × 10⁻¹² M'
  },
  { 
    target: 'gm1a', 
    pathogen: 'E. coli LT',
    organism: 'E. coli (ETEC)',
    affinity: 'high',
    disease: "Traveler's diarrhea",
    notes: 'Heat-labile enterotoxin, similar to cholera toxin'
  },
  { 
    target: 'gt1b', 
    pathogen: 'Tetanus toxin',
    organism: 'Clostridium tetani',
    affinity: 'high',
    disease: 'Tetanus',
    notes: 'Primary receptor. Extraneuronal release in spinal cord!'
  },
  { 
    target: 'gd1b', 
    pathogen: 'Tetanus toxin',
    organism: 'Clostridium tetani',
    affinity: 'medium',
    disease: 'Tetanus',
    notes: 'Secondary receptor'
  },
  { 
    target: 'gt1b', 
    pathogen: 'BoNT/A (Botox)',
    organism: 'Clostridium botulinum',
    affinity: 'high',
    disease: 'Botulism / Cosmetic',
    notes: 'Primary receptor for serotype A. Uptake at nerve terminals WITHOUT intraneuronal injection!'
  },
  { 
    target: 'gd1a', 
    pathogen: 'BoNT/A (Botox)',
    organism: 'Clostridium botulinum',
    affinity: 'medium',
    disease: 'Botulism / Cosmetic',
    notes: 'Secondary receptor for serotype A'
  },
  { 
    target: 'gd1a', 
    pathogen: 'BoNT/B',
    organism: 'Clostridium botulinum',
    affinity: 'high',
    disease: 'Botulism',
    notes: 'Primary receptor for serotype B + synaptotagmin II co-receptor'
  },
  { 
    target: 'gt1b', 
    pathogen: 'BoNT/B',
    organism: 'Clostridium botulinum',
    affinity: 'medium',
    disease: 'Botulism',
    notes: 'Secondary receptor for serotype B'
  },
  // Molecular mimicry - Campylobacter
  { 
    target: 'gm1a', 
    pathogen: 'C. jejuni LPS',
    organism: 'Campylobacter jejuni',
    affinity: 'mimicry',
    disease: 'GBS (Guillain-Barré)',
    notes: 'LPS mimics GM1 → anti-GM1 antibodies'
  },
  { 
    target: 'gd1a', 
    pathogen: 'C. jejuni LPS',
    organism: 'Campylobacter jejuni',
    affinity: 'mimicry',
    disease: 'GBS (AMAN variant)',
    notes: 'LPS mimics GD1a → anti-GD1a antibodies'
  },
  { 
    target: 'gq1c', 
    pathogen: 'C. jejuni LPS',
    organism: 'Campylobacter jejuni',
    affinity: 'mimicry',
    disease: 'Miller Fisher syndrome',
    notes: 'LPS mimics GQ1b → anti-GQ1b antibodies (85-90%)'
  },
];

// Viral ganglioside receptors
const VIRUS_BINDINGS = [
  // H1N1 → GT1b/GD1a → CNS/Orexin → Narcolepsy
  { 
    target: 'gd1a', 
    pathogen: 'Influenza A (H1N1)',
    organism: 'Influenza A virus',
    affinity: 'high',
    disease: 'Influenza / Narcolepsy?',
    notes: 'NeuAcα2-3Gal preference. HA binding. Associated with POST-VACCINATION NARCOLEPSY (Pandemrix 2009).'
  },
  { 
    target: 'gt1b', 
    pathogen: 'Influenza A (H1N1)',
    organism: 'Influenza A virus',
    affinity: 'medium',
    disease: 'Influenza / Narcolepsy?',
    notes: 'NA cleaves GT1b → GD1b. Potential RETROGRADE TRANSPORT vector to CNS!'
  },
  // H3N2 → GM3 → Cochlea → Hearing problems?
  { 
    target: 'gm3', 
    pathogen: 'Influenza A (H3N2)',
    organism: 'Influenza A virus',
    affinity: 'high',
    disease: 'Influenza / Hearing disorders?',
    notes: '⚠️ GM3 is ESSENTIAL for cochlear hair cells! H3N2 was dominant in Cuba 2016-2017 during "Havana Syndrome" — tinnitus, hearing problems, vertigo. GM3 sheds via EVs (unlike GT1b axonal transport) → likely LOCAL cochlear damage rather than CNS delivery.'
  },
  { 
    target: 'gm1a', 
    pathogen: 'SV40',
    organism: 'Simian virus 40',
    affinity: 'high',
    disease: 'Various (research tool)',
    notes: 'VP1 protein binds GM1 oligosaccharide'
  },
  { 
    target: 'gt1b', 
    pathogen: 'JC Virus',
    organism: 'JC polyomavirus',
    affinity: 'high',
    disease: 'PML (Progressive Multifocal Leukoencephalopathy)',
    notes: 'With 5-HT2A as co-receptor'
  },
  { 
    target: 'gd1b', 
    pathogen: 'JC Virus',
    organism: 'JC polyomavirus',
    affinity: 'high',
    disease: 'PML',
    notes: 'Alternative receptor'
  },
  { 
    target: 'gd1b', 
    pathogen: 'BK Virus',
    organism: 'BK polyomavirus',
    affinity: 'high',
    disease: 'Nephropathy (transplant)',
    notes: 'α2-8-linked disialic acid motif'
  },
  { 
    target: 'gt1b', 
    pathogen: 'BK Virus',
    organism: 'BK polyomavirus',
    affinity: 'high',
    disease: 'Nephropathy',
    notes: 'Terminal disialic acid required'
  },
  { 
    target: 'gm1a', 
    pathogen: 'Rotavirus',
    organism: 'Rotavirus',
    affinity: 'medium',
    disease: 'Gastroenteritis',
    notes: 'Sialic acid-dependent entry'
  },
  { 
    target: 'gd1a', 
    pathogen: 'Rotavirus',
    organism: 'Rotavirus',
    affinity: 'medium',
    disease: 'Gastroenteritis',
    notes: 'Alternative receptor'
  },
];

// Colors for pathogen tags
const PATHOGEN_COLORS = {
  high: "bg-purple-600 text-white",
  medium: "bg-purple-400 text-white",
  mimicry: "bg-orange-500 text-white",
};

const VIRUS_COLORS = {
  high: "bg-pink-600 text-white",
  medium: "bg-pink-400 text-white",
};

// Storage diseases (lysosomal accumulation)
const STORAGE_DISEASES = [
  {
    target: 'glccer',
    disease: 'Gaucher disease',
    gene: 'GBA',
    enzyme: 'Glucocerebrosidase',
    inheritance: 'AR',
    prevalence: '1:40,000 (general), 1:800 (Ashkenazi)',
    notes: 'Most common lysosomal storage disease. Type 1 (non-neuronopathic) most common.'
  },
  {
    target: 'gm1a',
    disease: 'GM1 gangliosidosis',
    gene: 'GLB1',
    enzyme: 'β-Galactosidase',
    inheritance: 'AR',
    prevalence: '1:100,000-200,000',
    notes: 'Three clinical forms: infantile, juvenile, adult. Progressive neurodegeneration.'
  },
  {
    target: 'gm2',
    disease: 'Tay-Sachs disease',
    gene: 'HEXA',
    enzyme: 'β-Hexosaminidase A',
    inheritance: 'AR',
    prevalence: '1:320,000 (general), 1:3,600 (Ashkenazi)',
    notes: 'Classic infantile form: cherry-red spot, developmental regression, death by age 4.'
  },
  {
    target: 'gm2',
    disease: 'Sandhoff disease',
    gene: 'HEXB',
    enzyme: 'β-Hexosaminidase A & B',
    inheritance: 'AR',
    prevalence: '1:300,000',
    notes: 'Similar to Tay-Sachs but affects more organs. Both GM2 and globosides accumulate.'
  },
  {
    target: 'gm3',
    disease: 'GM3 synthase deficiency',
    gene: 'ST3GAL5',
    enzyme: 'GM3 synthase',
    inheritance: 'AR',
    prevalence: 'Very rare (<50 cases)',
    notes: 'Amish epilepsy syndrome. Severe intellectual disability, seizures.'
  },
  {
    target: 'laccer',
    disease: 'Krabbe disease',
    gene: 'GALC',
    enzyme: 'Galactosylceramidase',
    inheritance: 'AR',
    prevalence: '1:100,000',
    notes: 'Globoid cell leukodystrophy. Severe white matter degeneration.'
  },
];

// Autoimmune diseases with anti-ganglioside antibodies
const AUTOIMMUNE_DISEASES = [
  {
    target: 'gm1a',
    disease: 'GBS (AIDP)',
    antibody: 'Anti-GM1 IgG',
    clinicalFeatures: 'Ascending paralysis, areflexia',
    trigger: 'Post-infectious (C. jejuni, CMV, EBV)',
    prognosis: '85% recover, 5% mortality',
    notes: 'Most common form of GBS. Demyelinating.'
  },
  {
    target: 'gd1a',
    disease: 'GBS (AMAN)',
    antibody: 'Anti-GD1a IgG',
    clinicalFeatures: 'Pure motor weakness, no sensory loss',
    trigger: 'C. jejuni (molecular mimicry)',
    prognosis: 'Variable, can be severe',
    notes: 'Acute Motor Axonal Neuropathy. Common in Asia, Mexico.'
  },
  {
    target: 'gd1b',
    disease: 'GBS (sensory variant)',
    antibody: 'Anti-GD1b IgG',
    clinicalFeatures: 'Sensory ataxia, large fiber sensory loss',
    trigger: 'Post-infectious',
    prognosis: 'Generally good',
    notes: 'Rare sensory-predominant form.'
  },
  {
    target: 'gq1c',
    disease: 'Miller Fisher syndrome',
    antibody: 'Anti-GQ1b IgG',
    clinicalFeatures: 'Ophthalmoplegia, ataxia, areflexia',
    trigger: 'C. jejuni, H. influenzae',
    prognosis: 'Excellent (self-limiting)',
    notes: 'Classic triad. GQ1b enriched in oculomotor nerves. 85-90% anti-GQ1b positive.'
  },
  {
    target: 'gt1b',
    disease: 'Bickerstaff encephalitis',
    antibody: 'Anti-GT1b / Anti-GQ1b IgG',
    clinicalFeatures: 'Ophthalmoplegia + DROWSINESS/STUPOR/COMA',
    trigger: 'Post-infectious (C. jejuni, viral)',
    prognosis: 'Variable, may require ICU',
    notes: '⚠️ KEY: Causes sleepiness/altered consciousness — like narcolepsy! Same antibodies (anti-GT1b) may target brainstem arousal centers.'
  },
  {
    target: 'gm1a',
    disease: 'MMN',
    antibody: 'Anti-GM1 IgM',
    clinicalFeatures: 'Asymmetric weakness, no sensory loss',
    trigger: 'Unknown (not post-infectious)',
    prognosis: 'Chronic, responds to IVIg',
    notes: 'Multifocal Motor Neuropathy. Conduction block on EMG.'
  },
  {
    target: 'gd1b',
    disease: 'CANOMAD',
    antibody: 'Anti-GD1b IgM (+ disialosyl)',
    clinicalFeatures: 'Chronic ataxia, ophthalmoplegia',
    trigger: 'Paraproteinemia',
    prognosis: 'Chronic, slowly progressive',
    notes: 'Chronic Ataxic Neuropathy with Ophthalmoplegia, M-protein, Agglutination, Disialosyl antibodies.'
  },
];

// Tumor-associated gangliosides
const TUMOR_ASSOCIATIONS = [
  // B-SERIES: Associated with WORSE prognosis
  {
    target: 'gd2',
    tumor: 'Neuroblastoma',
    expression: 'very_high',
    therapeuticTarget: true,
    drug: 'Dinutuximab (anti-GD2)',
    prognosis: 'poor',
    notes: 'GD2 is THE major immunotherapy target! FDA-approved for high-risk neuroblastoma. 95% of neuroblastomas express GD2.'
  },
  {
    target: 'gd2',
    tumor: 'Melanoma',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'Anti-GD2 trials',
    prognosis: 'poor',
    notes: 'High expression in malignant melanoma. GD2 marks cancer stem cells → metastasis.'
  },
  {
    target: 'gd2',
    tumor: 'Osteosarcoma',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'Dinutuximab trials',
    prognosis: 'poor',
    notes: 'Strong expression. GD2-CAR-T and antibody trials ongoing.'
  },
  {
    target: 'gd2',
    tumor: 'Ovarian cancer',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'Anti-GD2 trials',
    prognosis: 'poor',
    notes: '⚠️ PROGNOSIS: GD2 >7.1 ng/mL → PFS 23 months vs 52 months! Independent predictor of shorter OS.'
  },
  {
    target: 'gd2',
    tumor: 'Breast cancer (stem cells)',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'CAR-T trials',
    prognosis: 'poor',
    notes: 'GD2 marks breast cancer STEM CELLS. Promotes tumorigenesis, metastasis. High = poor prognosis.'
  },
  {
    target: 'gd3',
    tumor: 'Melanoma',
    expression: 'very_high',
    therapeuticTarget: true,
    drug: 'Anti-GD3 vaccines',
    prognosis: 'poor',
    notes: 'GD3 is the dominant ganglioside in melanoma. ⚠️ 9-O-acetyl-GD3 blocks apoptosis!'
  },
  {
    target: 'gd3',
    tumor: 'Ovarian cancer',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'Anti-GD3 trials',
    prognosis: 'poor',
    notes: '⚠️ PROGNOSIS: GD3 >12.8 ng/mL → PFS 31 months vs 67 months! Strong predictor of poor outcome.'
  },
  {
    target: 'gd3',
    tumor: 'Glioblastoma',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'CAR-T trials',
    prognosis: 'poor',
    notes: '9-O-acetyl-GD3 prevents apoptosis → tumor survival. Target for restoration of GD3 pro-apoptotic function.'
  },
  // A-SERIES: Can be TUMOR SUPPRESSIVE
  {
    target: 'gm3',
    tumor: 'EGFR+ tumors (suppressor)',
    expression: 'variable',
    therapeuticTarget: false,
    drug: 'GM3 analogues (antitumor)',
    prognosis: 'protective',
    notes: '✓ TUMOR SUPPRESSIVE: GM3 inhibits EGFR → blocks growth signaling. High GM3 = better prognosis in some cancers.'
  },
  {
    target: 'gm3',
    tumor: 'Bladder cancer',
    expression: 'variable',
    therapeuticTarget: false,
    drug: 'Exogenous GM3 (therapeutic)',
    prognosis: 'protective',
    notes: '✓ Exogenous GM3 INHIBITS tumor growth and reduces cell adhesion via integrin inhibition.'
  },
  {
    target: 'gm3',
    tumor: 'Breast cancer',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Biomarker',
    prognosis: 'variable',
    notes: 'Complex role: GM3 elevation may be diagnostic marker, but also has EGFR-inhibiting antitumor effects.'
  },
  {
    target: 'gm2',
    tumor: 'Melanoma',
    expression: 'moderate',
    therapeuticTarget: true,
    drug: 'GM2 vaccines (GMK)',
    prognosis: 'variable',
    notes: 'Target for cancer vaccines. GM2-KLH conjugate vaccines tested in Phase III trials.'
  },
  {
    target: 'gm2',
    tumor: 'Lung adenocarcinoma',
    expression: 'moderate',
    therapeuticTarget: false,
    drug: 'Biomarker',
    prognosis: 'variable',
    notes: 'Expressed in subset of lung cancers. Associated with tumor progression.'
  },
  {
    target: 'gd1a',
    tumor: 'Neuroectodermal tumors',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    notes: 'General marker for tumors of neural crest origin.'
  },
  {
    target: 'gt1b',
    tumor: 'Neuroblastoma (low)',
    expression: 'low',
    therapeuticTarget: false,
    drug: 'N/A',
    notes: 'Unlike GD2, GT1b is DOWNREGULATED in neuroblastoma — tumors de-differentiate toward simpler gangliosides.'
  },
];

// Colors for disease tags
const STORAGE_COLORS = {
  severe: "bg-red-700 text-white",
  moderate: "bg-orange-600 text-white",
};

const AUTOIMMUNE_COLORS = {
  acute: "bg-cyan-600 text-white",
  chronic: "bg-teal-600 text-white",
};

const TUMOR_COLORS = {
  very_high: "bg-fuchsia-700 text-white",
  high: "bg-fuchsia-500 text-white",
  moderate: "bg-fuchsia-400 text-white",
  elevated: "bg-fuchsia-300 text-fuchsia-900",
  low: "bg-slate-400 text-white",
};

// Genetic locations of ganglioside-related enzymes
const GENE_LOCATIONS = {
  // SYNTHESIS enzymes
  synthesis: [
    { gene: 'UGCG', chromosome: '9q31.3', enzyme: 'Ceramide Glucosyltransferase', product: 'GlcCer', notes: 'First committed step in glycosphingolipid synthesis' },
    { gene: 'B4GALT6', chromosome: '18q12.1', enzyme: 'LacCer Synthase', product: 'LacCer', notes: 'Also B4GALT5 (9p21.1)' },
    { gene: 'ST3GAL5', chromosome: '2p11.2', enzyme: 'GM3 Synthase', product: 'GM3', notes: 'Deficiency causes severe epilepsy, deafness' },
    { gene: 'ST8SIA1', chromosome: '12p12.1', enzyme: 'GD3 Synthase', product: 'GD3', notes: 'Initiates B-series' },
    { gene: 'ST8SIA5', chromosome: '18q21.1', enzyme: 'GT3 Synthase', product: 'GT3', notes: 'Initiates C-series' },
    { gene: 'B4GALNT1', chromosome: '12q13.3', enzyme: 'GM2/GD2 Synthase', product: 'GM2, GD2, GT2', notes: 'Key branching enzyme' },
    { gene: 'B3GALT4', chromosome: '6p21.32', enzyme: 'GM1/GD1b Synthase', product: 'GM1a, GD1b, GT1c', notes: '⚠️ IN HLA REGION! Key for GT1b pathway', highlight: true },
    { gene: 'ST3GAL2', chromosome: '16q22.1', enzyme: 'GD1a/GT1b Synthase', product: 'GD1a, GT1b, GQ1c', notes: 'Final sialylation step' },
  ],
  // DEGRADATION enzymes (neuraminidases/sialidases)
  degradation: [
    { gene: 'NEU1', chromosome: '6p21.33', enzyme: 'Neuraminidase 1 (Lysosomal)', product: 'Cleaves sialic acid', notes: '⚠️ IN HLA REGION! Deficiency → Sialidosis', highlight: true },
    { gene: 'NEU2', chromosome: '2q37.1', enzyme: 'Neuraminidase 2 (Cytosolic)', product: 'Cleaves sialic acid', notes: 'Cytoplasmic sialidase' },
    { gene: 'NEU3', chromosome: '11q13.5', enzyme: 'Neuraminidase 3 (Plasma membrane)', product: 'Cleaves GM3→LacCer', notes: 'Plasma membrane, ganglioside-specific' },
    { gene: 'NEU4', chromosome: '2q37.3', enzyme: 'Neuraminidase 4 (Mitochondrial)', product: 'Cleaves sialic acid', notes: 'Also in ER/lysosomes' },
    { gene: 'GLB1', chromosome: '3p22.3', enzyme: 'β-Galactosidase', product: 'GM2, GD2, etc.', notes: 'Deficiency → GM1 gangliosidosis' },
    { gene: 'HEXA', chromosome: '15q23', enzyme: 'β-Hexosaminidase A (α-subunit)', product: 'GM3, asialo-GM2', notes: 'Deficiency → Tay-Sachs disease' },
    { gene: 'HEXB', chromosome: '5q13.3', enzyme: 'β-Hexosaminidase B (β-subunit)', product: 'GA2, globoside', notes: 'Deficiency → Sandhoff disease' },
    { gene: 'GBA', chromosome: '1q22', enzyme: 'Glucocerebrosidase', product: 'Ceramide', notes: 'Deficiency → Gaucher disease' },
  ],
  // LINKED DISEASE GENES - genes in SAME LD BLOCK as ganglioside genes
  // Only includes diseases where: 1) mechanism is unclear, 2) within ~500kb (HLA LD range)
  // NOTE: HLA region (6p21) has uniquely strong LD extending up to 540kb!
  linkedDiseases: [
    // 6p21.3 region - STRONG LD! B3GALT4 and HLA-DQB1 are BOTH at 6p21.32!
    { gene: 'HLA-DQB1', chromosome: '6p21.32', nearGangliosideGene: 'B3GALT4 (same band!)', disease: 'Narcolepsy, Type 1 Diabetes, Celiac Disease', notes: '🔥 HOW does HLA kill orexin cells? No clear mechanism! Same LD block as B3GALT4/NEU1!', critical: true },
    { gene: 'CCHCR1', chromosome: '6p21.33', nearGangliosideGene: 'NEU1 (same band!)', disease: 'Psoriasis', notes: '"Precise function remains incompletely understood" — within HLA LD block.' },
    { gene: 'NOTCH4', chromosome: '6p21.32', nearGangliosideGene: 'B3GALT4 (same band!)', disease: 'Schizophrenia', notes: 'Mixed results! Multiple studies find NO association. Same LD block as B3GALT4.' },
    // 15q23 - need to verify LD extent here
    { gene: 'DFNB48 locus', chromosome: '15q23-25.1', nearGangliosideGene: 'HEXA (15q23)', disease: 'Nonsyndromic Recessive Deafness', notes: '🟢 Not even a gene — just a LOCUS! GM3 essential for cochlea. Same chromosomal region.', goodExample: true },
  ],
};

interface EnzymeTagProps {
  code: string;
  name: string;
  colorClass: string;
  isAnimated?: boolean;
}

const EnzymeTag: React.FC<EnzymeTagProps> = ({ code, name, colorClass, isAnimated = false }) => (
  <div 
    className={`group relative inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded cursor-help shadow-sm z-10 ${colorClass} ${isAnimated ? 'animate-enzyme-pulse' : ''}`}
  >
    {code}
    {isAnimated && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-ping"></span>
    )}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg">
      {isAnimated && <span className="text-amber-300">★ </span>}
      {name}
      {isAnimated && <span className="block text-amber-300 text-[10px]">Located at 6p21.32 (HLA region)</span>}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

interface PathogenTagProps {
  pathogen: string;
  organism: string;
  affinity: string;
  disease: string;
  notes: string;
  isVirus?: boolean;
}

const PathogenTag: React.FC<PathogenTagProps> = ({ pathogen, organism, affinity, disease, notes, isVirus = false }) => {
  const colors = isVirus ? VIRUS_COLORS : PATHOGEN_COLORS;
  const colorClass = colors[affinity as keyof typeof colors] || colors.high;
  const isKeyBinding = pathogen.includes('Tetanus') || pathogen.includes('H1N1') || pathogen.includes('C. jejuni');
  
  return (
    <div 
      className={`group relative inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold rounded cursor-help shadow-sm z-10 ${colorClass} ${isKeyBinding ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
    >
      {pathogen.length > 12 ? pathogen.substring(0, 10) + '…' : pathogen}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg max-w-xs">
        <div className="font-bold text-sm">{pathogen}</div>
        <div className="text-slate-400 italic text-[10px]">{organism}</div>
        <div className="mt-1 text-[10px]">
          <span className={`px-1 py-0.5 rounded ${affinity === 'mimicry' ? 'bg-orange-500' : affinity === 'high' ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {affinity === 'mimicry' ? '⚠️ Mimicry' : affinity === 'high' ? '● High affinity' : '○ Medium affinity'}
          </span>
        </div>
        <div className="mt-1 text-amber-300 font-medium">{disease}</div>
        <div className="mt-1 text-slate-300 text-[10px] whitespace-normal max-w-[200px]">{notes}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

interface StorageTagProps {
  disease: string;
  gene: string;
  enzyme: string;
  inheritance: string;
  prevalence: string;
  notes: string;
}

const StorageTag: React.FC<StorageTagProps> = ({ disease, gene, enzyme, inheritance, prevalence, notes }) => {
  const isSevere = disease.includes('Tay-Sachs') || disease.includes('Sandhoff') || disease.includes('Krabbe');
  
  return (
    <div 
      className={`group relative inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold rounded cursor-help shadow-sm z-10 ${isSevere ? 'bg-red-700 text-white' : 'bg-orange-600 text-white'}`}
    >
      {disease.length > 12 ? disease.substring(0, 10) + '…' : disease}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg max-w-xs">
        <div className="font-bold text-sm">{disease}</div>
        <div className="mt-1 text-[10px]">
          <span className="text-red-300">Gene:</span> <span className="font-mono">{gene}</span>
        </div>
        <div className="text-[10px]">
          <span className="text-red-300">Enzyme:</span> {enzyme}
        </div>
        <div className="text-[10px]">
          <span className="text-red-300">Inheritance:</span> {inheritance} | <span className="text-red-300">Prevalence:</span> {prevalence}
        </div>
        <div className="mt-1 text-slate-300 text-[10px] whitespace-normal max-w-[220px]">{notes}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

interface AutoimmuneTagProps {
  disease: string;
  antibody: string;
  clinicalFeatures: string;
  trigger: string;
  prognosis: string;
  notes: string;
}

const AutoimmuneTag: React.FC<AutoimmuneTagProps> = ({ disease, antibody, clinicalFeatures, trigger, prognosis, notes }) => {
  const isAcute = disease.includes('GBS') || disease.includes('Miller Fisher') || disease.includes('Bickerstaff');
  const isHighlighted = disease.includes('Miller Fisher') || disease.includes('Bickerstaff');
  
  return (
    <div 
      className={`group relative inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold rounded cursor-help shadow-sm z-10 ${isAcute ? 'bg-cyan-600 text-white' : 'bg-teal-600 text-white'} ${isHighlighted ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
    >
      {disease.length > 12 ? disease.substring(0, 10) + '…' : disease}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg max-w-xs">
        <div className="font-bold text-sm">{disease}</div>
        <div className="mt-1 text-[10px]">
          <span className="text-cyan-300">Antibody:</span> <span className="font-mono">{antibody}</span>
        </div>
        <div className="text-[10px]">
          <span className="text-cyan-300">Features:</span> {clinicalFeatures}
        </div>
        <div className="text-[10px]">
          <span className="text-cyan-300">Trigger:</span> {trigger}
        </div>
        <div className="text-[10px]">
          <span className="text-cyan-300">Prognosis:</span> {prognosis}
        </div>
        <div className="mt-1 text-slate-300 text-[10px] whitespace-normal max-w-[220px]">{notes}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

interface TumorTagProps {
  tumor: string;
  expression: string;
  therapeuticTarget: boolean;
  drug: string;
  prognosis: string;
  notes: string;
}

const TumorTag: React.FC<TumorTagProps> = ({ tumor, expression, therapeuticTarget, drug, prognosis, notes }) => {
  const colorClass = TUMOR_COLORS[expression as keyof typeof TUMOR_COLORS] || TUMOR_COLORS.elevated;
  const isKeyTarget = therapeuticTarget && (expression === 'very_high' || expression === 'high');
  const isPoorPrognosis = prognosis === 'poor';
  const isProtective = prognosis === 'protective';
  
  return (
    <div 
      className={`group relative inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold rounded cursor-help shadow-sm z-10 ${isProtective ? 'bg-green-600 text-white' : colorClass} ${isKeyTarget ? 'ring-2 ring-amber-300 ring-offset-1' : ''} ${isPoorPrognosis ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
    >
      {tumor.length > 12 ? tumor.substring(0, 10) + '…' : tumor}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg max-w-xs">
        <div className="font-bold text-sm">{tumor}</div>
        {/* Prognosis indicator */}
        <div className="mt-1 text-[10px]">
          <span className="text-fuchsia-300">Prognosis:</span>{' '}
          <span className={`px-1.5 py-0.5 rounded font-bold ${
            prognosis === 'poor' ? 'bg-red-600 text-white' : 
            prognosis === 'protective' ? 'bg-green-600 text-white' : 
            'bg-slate-500 text-white'
          }`}>
            {prognosis === 'poor' ? '⚠️ WORSE' : 
             prognosis === 'protective' ? '✓ PROTECTIVE' : 
             '~ Variable'}
          </span>
        </div>
        <div className="mt-1 text-[10px]">
          <span className="text-fuchsia-300">Expression:</span>{' '}
          <span className={`px-1 py-0.5 rounded ${
            expression === 'very_high' ? 'bg-fuchsia-600' : 
            expression === 'high' ? 'bg-fuchsia-500' : 
            expression === 'moderate' ? 'bg-fuchsia-400 text-fuchsia-900' :
            expression === 'low' ? 'bg-slate-500' : 'bg-fuchsia-300 text-fuchsia-900'
          }`}>
            {expression === 'very_high' ? '●●● Very High' : 
             expression === 'high' ? '●●○ High' : 
             expression === 'moderate' ? '●○○ Moderate' :
             expression === 'low' ? '↓ Low' : '● Variable'}
          </span>
        </div>
        <div className="text-[10px] mt-1">
          <span className="text-fuchsia-300">Therapeutic target:</span>{' '}
          {therapeuticTarget ? <span className="text-green-400">✓ Yes</span> : <span className="text-slate-400">Not yet</span>}
        </div>
        {therapeuticTarget && drug !== 'N/A' && drug !== 'Biomarker' && (
          <div className="text-[10px]">
            <span className="text-fuchsia-300">Drug:</span> <span className="text-amber-300">{drug}</span>
          </div>
        )}
        <div className="mt-1 text-slate-300 text-[10px] whitespace-normal max-w-[220px]">{notes}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

interface ConnectionProps {
  type: string;
  enzyme: string;
  enzymeName: string;
  mode: 'synthesis' | 'degradation';
  currentMode: ViewMode;
}

const Connection: React.FC<ConnectionProps> = ({ type, enzyme, enzymeName, mode, currentMode }) => {
  if (currentMode !== 'synthesis' && currentMode !== 'degradation') return null;
  if (mode !== currentMode) return null;

  const isSynth = mode === 'synthesis';
  const isKeyEnzyme = KEY_ENZYMES.includes(enzyme);
  const colorClass = isKeyEnzyme 
    ? ENZYME_COLORS.key_enzyme 
    : (isSynth ? ENZYME_COLORS.synthase : ENZYME_COLORS.catabolic);
  
  let positionClass = "";

  if (type === 'vertical') {
    positionClass = "absolute left-1/2 -translate-x-1/2 top-full h-8 w-0.5 bg-slate-300 flex items-center justify-center";
  } else if (type === 'vertical-up') {
    positionClass = "absolute left-1/2 -translate-x-1/2 bottom-full h-8 w-0.5 bg-slate-300 flex items-center justify-center";
  } else if (type === 'horizontal') {
    positionClass = "absolute top-1/2 -translate-y-1/2 left-full w-8 h-0.5 bg-slate-300 flex items-center justify-center";
  } else if (type === 'horizontal-back') {
    positionClass = "absolute top-1/2 -translate-y-1/2 right-full w-8 h-0.5 bg-slate-300 flex items-center justify-center";
  } else if (type === 'right-branch') {
     return (
       <div className="absolute top-8 -right-4 z-20 flex flex-col items-center">
         <div className="w-8 h-0.5 bg-slate-300 rotate-45 transform origin-left absolute top-0 left-0"></div>
         <div className="translate-x-4 translate-y-2">
            <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
         </div>
       </div>
     )
  } else if (type === 'right-branch-back') {
     return (
       <div className="absolute bottom-8 -right-4 z-20 flex flex-col items-center">
         <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
       </div>
     )
  }

  return (
    <div className={positionClass}>
      <div className="bg-slate-300 absolute inset-0"></div>
      <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
    </div>
  );
};

interface GangliosideMapProps {
  labels?: {
    title?: string;
    subtitle?: string;
    biosynthesis?: string;
    degradation?: string;
    pathogens?: string;
    viruses?: string;
    clinicalRelevance?: string;
    hoverInfo?: string;
  };
}

export default function GangliosideMap({ labels }: GangliosideMapProps) {
  const [mode, setMode] = useState<ViewMode>('synthesis');

  const defaultLabels = {
    title: 'Ganglioside Metabolism Map',
    subtitle: 'Interactive pathway explorer: metabolism, pathogens, and disease',
    biosynthesis: 'Biosynthesis',
    degradation: 'Degradation',
    pathogens: 'Bacteria',
    viruses: 'Viruses',
    storage: 'Storage Diseases',
    autoimmune: 'Autoimmune',
    tumors: 'Tumors',
    genetics: 'Gene Locations',
    clinicalRelevance: 'Clinical Relevance',
    hoverInfo: 'Hover for details',
    ...labels
  };

  // Get bindings for current mode
  const getBindingsForNode = (nodeId: string) => {
    if (mode === 'pathogens') {
      return { type: 'pathogen', data: PATHOGEN_BINDINGS.filter(b => b.target === nodeId) };
    } else if (mode === 'viruses') {
      return { type: 'virus', data: VIRUS_BINDINGS.filter(b => b.target === nodeId) };
    } else if (mode === 'storage') {
      return { type: 'storage', data: STORAGE_DISEASES.filter(b => b.target === nodeId) };
    } else if (mode === 'autoimmune') {
      return { type: 'autoimmune', data: AUTOIMMUNE_DISEASES.filter(b => b.target === nodeId) };
    } else if (mode === 'tumors') {
      return { type: 'tumor', data: TUMOR_ASSOCIATIONS.filter(b => b.target === nodeId) };
    }
    return { type: null, data: [] };
  };

  // Get footer content based on mode
  const getFooterContent = () => {
    switch (mode) {
      case 'synthesis':
        return (
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>A-series (blue):</strong> GM3 sheds via EVs/exosomes. Tumor suppressive (inhibits EGFR). Found in CSF.</li>
              <li><strong>B-series (red):</strong> GT1b has <em>axonal transport</em> + extraneuronal release. High shedding via EVs.</li>
              <li><strong className="text-amber-600">B3GALT4 (6p21.32):</strong> Creates GD1b → GT1b. Located in HLA region!</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-xs mt-2">
              <strong className="text-blue-800">🔑 Key difference — Transport mechanisms:</strong>
              <p className="text-blue-700 mt-1">
                <strong>GT1b (B-series):</strong> Retrograde axonal transport → extraneuronal release in CNS (like tetanus toxin)<br/>
                <strong>GM3 (A-series):</strong> EV/exosome shedding → local effects, NO axonal transport described
              </p>
            </div>
            <div className="bg-slate-100 border-l-4 border-slate-500 p-2 text-xs mt-2">
              <strong className="text-slate-800">🔬 The Hidden System:</strong>
              <span className="text-slate-700"> Gangliosides determine which cells are targeted by pathogens, toxins, and autoimmune responses. 
              This "hidden" glycosphingolipid code explains why the same pathogen can cause completely different diseases 
              depending on which ganglioside it binds.</span>
            </div>
          </div>
        );
      case 'degradation':
        return (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Lysosomal pathway:</strong> Sequential removal of sugars by specific hydrolases.</li>
            <li><strong>Storage diseases:</strong> Tay-Sachs (GM2), Sandhoff (GM2), GM1 gangliosidosis, Gaucher (GlcCer).</li>
            <li><strong>B-series exception:</strong> GT1b/GQ1b shed via EVs → bypass lysosomal degradation.</li>
          </ul>
        );
      case 'pathogens':
        return (
          <div className="space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-purple-600">Cholera toxin → GM1:</strong> Classic receptor. Remains intraneuronal after transport.</li>
              <li><strong className="text-amber-600">Tetanus toxin → GT1b:</strong> Released extraneuronally in spinal cord! Key for hypothesis.</li>
              <li><strong className="text-orange-600">C. jejuni LPS:</strong> Molecular mimicry → GBS (anti-GM1/GD1a) or Miller Fisher (anti-GQ1b).</li>
            </ul>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
              <h5 className="font-bold text-purple-800 text-sm mb-1">💉 Botulinum Toxin (Botox) — Key Considerations</h5>
              <p className="text-purple-700 text-xs mb-2">
                Botulinum toxin binds both <strong>GT1b</strong> (BoNT/A) and <strong>GD1a</strong> (BoNT/B). 
                It's taken up at nerve terminals <strong>without intraneuronal injection</strong> — 
                and motor neurons have the <em>same axon length</em> to the spinal cord as sensory neurons.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-2 text-xs">
                <strong className="text-amber-800">⚠️ Challenge to the hypothesis:</strong>
                <span className="text-amber-700"> If Botox enters motor neurons without direct injection, why would vaccine antigens require it? 
                Key difference: Botox <em>acts locally</em> at the neuromuscular junction (blocks ACh release there). 
                It doesn't need to reach the spinal cord. Tetanus toxin, however, must travel retrogradely to the CNS. 
                The question remains: is intraneuronal injection necessary for <em>efficient</em> retrograde transport, 
                or just for sufficient <em>dose</em>?</span>
              </div>
            </div>
          </div>
        );
      case 'viruses':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <h5 className="font-bold text-pink-800 text-sm mb-2">🧠 H1N1 → GT1b/GD1a → CNS</h5>
                <ul className="text-pink-700 text-xs space-y-1">
                  <li>• HA binds sialic acid on GT1b/GD1a</li>
                  <li>• NA cleaves GT1b → GD1b</li>
                  <li>• <strong>Pandemrix 2009 → Narcolepsy</strong></li>
                  <li>• Target: Orexin cells in hypothalamus</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h5 className="font-bold text-amber-800 text-sm mb-2">👂 H3N2 → GM3 → Cochlea</h5>
                <ul className="text-amber-700 text-xs space-y-1">
                  <li>• HA binds GM3 with high affinity</li>
                  <li>• GM3 is <strong>essential for cochlear hair cells</strong></li>
                  <li>• <strong>Cuba 2016-2017: "Havana Syndrome"?</strong></li>
                  <li>• Symptoms: Tinnitus, hearing disturbances, vertigo</li>
                </ul>
              </div>
            </div>
            <div className="bg-slate-100 border-l-4 border-slate-400 p-3">
              <h5 className="font-bold text-slate-800 text-sm mb-1">🔬 The Hidden Ganglioside System — Think Broader!</h5>
              <p className="text-slate-700 text-xs">
                <strong>Different influenza strains → Different gangliosides → Different diseases:</strong> 
                Gangliosides are not just a curiosity — they determine which cells are affected. 
                H1N1 (GT1b) → brain. H3N2 (GM3) → inner ear. This "hidden" system explains 
                why the same virus family can cause completely different symptoms. <em>We need to think broader 
                about the role of gangliosides in unexplained syndromes.</em>
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Polyomavirus (JC, BK):</strong> GT1b/GD1b → neurotropism → PML</li>
              <li><strong>SV40 → GM1:</strong> Classic model for ganglioside-mediated virus uptake</li>
            </ul>
          </div>
        );
      case 'storage':
        return (
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-red-600">A-series diseases:</strong> GM1 gangliosidosis, Tay-Sachs, Sandhoff — severe neurodegeneration.</li>
              <li><strong className="text-orange-600">Precursor diseases:</strong> Gaucher (GlcCer), Krabbe (GalCer) — enzyme replacement available for some.</li>
              <li><strong className="text-slate-600">GM3 synthase deficiency:</strong> Very rare. Blocks entire ganglioside pathway.</li>
            </ul>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-2 text-xs">
              <strong className="text-amber-800">Key observation:</strong>
              <span className="text-amber-700"> No storage diseases for GD1b or GT1b! B-series gangliosides are shed via EVs, 
              bypassing lysosomal accumulation — but increasing immune exposure.</span>
            </div>
          </div>
        );
      case 'autoimmune':
        return (
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-cyan-600">GBS variants:</strong> AIDP (demyelinating), AMAN (axonal) — different antibody profiles.</li>
              <li><strong className="text-amber-600">Miller Fisher:</strong> Anti-GQ1b → ophthalmoplegia, ataxia, areflexia.</li>
              <li><strong className="text-teal-600">Chronic forms:</strong> MMN (anti-GM1 IgM), CANOMAD (anti-disialosyl).</li>
            </ul>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-2 text-xs">
              <strong className="text-amber-800">🔑 Bickerstaff Encephalitis — The Sleeping Disease Connection:</strong>
              <p className="text-amber-700 mt-1">
                Anti-GT1b/GQ1b antibodies cause <strong>drowsiness, stupor, and coma</strong> — disturbances of consciousness 
                remarkably similar to narcolepsy and encephalitis lethargica! This suggests the same antibodies that target 
                oculomotor nerves can also affect brainstem arousal centers. If this process is more selective (targeting only 
                orexin neurons), the result could be narcolepsy rather than acute encephalitis.
              </p>
            </div>
          </div>
        );
      case 'tumors':
        return (
          <div className="space-y-3">
            {/* A-series vs B-series prognosis comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-bold text-green-800 text-sm mb-2">✓ A-SERIES → TUMOR SUPPRESSIVE</h5>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>• <strong>GM3 inhibits EGFR</strong> → blocks growth signaling</li>
                  <li>• GM3 disrupts integrin/EGFR interaction → reduces migration</li>
                  <li>• Synthetic GM3 analogs show <strong>anti-tumor effect</strong></li>
                  <li>• Exogenous GM3 <strong>inhibits</strong> tumor growth</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-bold text-red-800 text-sm mb-2">⚠️ B-SERIES → WORSE PROGNOSIS</h5>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• <strong>GD2 high</strong> in ovarian cancer: PFS <strong>23 mo</strong> vs 52 mo</li>
                  <li>• <strong>GD3 high</strong> in ovarian cancer: PFS <strong>31 mo</strong> vs 67 mo</li>
                  <li>• GD2 marks <strong>cancer stem cells</strong> in breast cancer</li>
                  <li>• 9-O-acetyl-GD3 <strong>blocks apoptosis</strong> → tumor resistance</li>
                </ul>
              </div>
            </div>
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-3">
              <h5 className="font-bold text-fuchsia-800 text-sm mb-1">🔬 The GD3 Paradox: Apoptosis Escape</h5>
              <p className="text-fuchsia-700 text-xs mb-2">
                GD3 is actually <strong>pro-apoptotic</strong> in normal cells (activates mitochondrial pathway). 
                But tumor cells <strong>modify</strong> GD3 via 9-O-acetylation → blocks the apoptosis signal!
                In glioblastoma: Reduce 9-O-acetyl-GD3 = restore apoptosis = tumor cell death.
              </p>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-2 text-xs">
              <strong className="text-amber-800">🔗 Connection to hypothesis:</strong>
              <span className="text-amber-700"> GT1b is typically DOWNREGULATED in tumors. This is the opposite of 
              what we see in neural transport — where GT1b is critical. The "simplified" tumor ganglioside profile 
              may protect tumors from immune surveillance that GT1b-shedding normally enables.</span>
            </div>
          </div>
        );
      case 'genetics':
        return (
          <div className="space-y-4">
            {/* Synthesis genes */}
            <div>
              <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Biosynthesis Genes
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-emerald-50 border-b border-emerald-200">
                      <th className="text-left py-2 px-3 font-bold text-emerald-800">Gene</th>
                      <th className="text-left py-2 px-3 font-bold text-emerald-800">Chromosome</th>
                      <th className="text-left py-2 px-3 font-bold text-emerald-800">Enzyme</th>
                      <th className="text-left py-2 px-3 font-bold text-emerald-800">Product</th>
                      <th className="text-left py-2 px-3 font-bold text-emerald-800">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GENE_LOCATIONS.synthesis.map((g, i) => (
                      <tr key={i} className={`border-b border-emerald-100 ${g.highlight ? 'bg-amber-50' : ''}`}>
                        <td className={`py-1.5 px-3 font-mono font-bold ${g.highlight ? 'text-amber-700' : 'text-emerald-700'}`}>{g.gene}</td>
                        <td className={`py-1.5 px-3 font-mono ${g.highlight ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>{g.chromosome}</td>
                        <td className="py-1.5 px-3 text-slate-700">{g.enzyme}</td>
                        <td className="py-1.5 px-3 text-slate-600">{g.product}</td>
                        <td className={`py-1.5 px-3 ${g.highlight ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>{g.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Degradation genes */}
            <div>
              <h4 className="font-bold text-rose-800 text-sm mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Degradation Genes (Neuraminidases & Hydrolases)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-rose-50 border-b border-rose-200">
                      <th className="text-left py-2 px-3 font-bold text-rose-800">Gene</th>
                      <th className="text-left py-2 px-3 font-bold text-rose-800">Chromosome</th>
                      <th className="text-left py-2 px-3 font-bold text-rose-800">Enzyme</th>
                      <th className="text-left py-2 px-3 font-bold text-rose-800">Function</th>
                      <th className="text-left py-2 px-3 font-bold text-rose-800">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GENE_LOCATIONS.degradation.map((g, i) => (
                      <tr key={i} className={`border-b border-rose-100 ${g.highlight ? 'bg-amber-50' : ''}`}>
                        <td className={`py-1.5 px-3 font-mono font-bold ${g.highlight ? 'text-amber-700' : 'text-rose-700'}`}>{g.gene}</td>
                        <td className={`py-1.5 px-3 font-mono ${g.highlight ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>{g.chromosome}</td>
                        <td className="py-1.5 px-3 text-slate-700">{g.enzyme}</td>
                        <td className="py-1.5 px-3 text-slate-600">{g.product}</td>
                        <td className={`py-1.5 px-3 ${g.highlight ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>{g.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LINKED DISEASE GENES - the key insight! */}
            <div className="border-2 border-amber-400 rounded-lg overflow-hidden">
              <div className="bg-amber-400 px-3 py-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  🔥 Linked Disease Genes — Potentially Misattributed to HLA!
                </h4>
              </div>
              <div className="p-3 bg-amber-50">
                <p className="text-amber-800 text-xs mb-3">
                  These genes are located <strong>NEAR ganglioside metabolism genes</strong> and have disease associations. 
                  Due to <strong>linkage disequilibrium</strong>, the disease might actually be caused by the nearby 
                  ganglioside gene, not the gene it's attributed to!
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-amber-100 border-b border-amber-300">
                        <th className="text-left py-2 px-2 font-bold text-amber-900">Disease Gene</th>
                        <th className="text-left py-2 px-2 font-bold text-amber-900">Location</th>
                        <th className="text-left py-2 px-2 font-bold text-amber-900">Near</th>
                        <th className="text-left py-2 px-2 font-bold text-amber-900">Associated Disease</th>
                        <th className="text-left py-2 px-2 font-bold text-amber-900">Could it be ganglioside-related?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GENE_LOCATIONS.linkedDiseases.map((g, i) => {
                        const rowBg = g.critical ? 'bg-red-50' : (g as any).goodExample ? 'bg-emerald-50' : '';
                        const geneColor = g.critical ? 'text-red-700' : (g as any).goodExample ? 'text-emerald-700' : 'text-amber-700';
                        const diseaseStyle = g.critical ? 'text-red-700 font-bold' : (g as any).goodExample ? 'text-emerald-700 font-bold' : 'text-slate-700';
                        const notesColor = g.critical ? 'text-red-600' : (g as any).goodExample ? 'text-emerald-600' : 'text-slate-500';
                        return (
                          <tr key={i} className={`border-b border-amber-200 ${rowBg}`}>
                            <td className={`py-1.5 px-2 font-mono font-bold ${geneColor}`}>{g.gene}</td>
                            <td className="py-1.5 px-2 font-mono text-slate-600">{g.chromosome}</td>
                            <td className="py-1.5 px-2 font-mono text-emerald-600 font-bold">{g.nearGangliosideGene}</td>
                            <td className={`py-1.5 px-2 ${diseaseStyle}`}>{g.disease}</td>
                            <td className={`py-1.5 px-2 text-[10px] ${notesColor}`}>{g.notes}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Key insight */}
            <div className="bg-red-50 border-l-4 border-red-400 p-3">
              <h5 className="font-bold text-red-800 text-sm mb-1">🎯 The Narcolepsy-HLA Reinterpretation</h5>
              <p className="text-red-700 text-xs">
                <strong>HLA-DQB1*06:02</strong> is the strongest genetic risk factor for narcolepsy. But <strong>B3GALT4</strong> 
                (which synthesizes GT1b precursors) is at <strong>6p21.32</strong> — essentially the SAME location! 
                The "HLA association" might actually be <strong>linkage to a B3GALT4 variant</strong> that increases GT1b levels, 
                making these individuals more susceptible to ganglioside-mediated antigen transport to the CNS.
              </p>
            </div>

            {/* Chromosome overview */}
            <div className="bg-slate-100 rounded-lg p-3">
              <h5 className="font-bold text-slate-800 text-sm mb-2">Chromosomal Distribution</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-white rounded p-2 border">
                  <span className="font-bold text-amber-600">Chr 6p21</span>
                  <div className="text-slate-600">B3GALT4, NEU1</div>
                  <div className="text-amber-500 text-[10px]">⚠️ HLA region</div>
                </div>
                <div className="bg-white rounded p-2 border">
                  <span className="font-bold text-slate-600">Chr 15q23</span>
                  <div className="text-slate-600">HEXA</div>
                  <div className="text-slate-400 text-[10px]">Tay-Sachs</div>
                </div>
                <div className="bg-white rounded p-2 border">
                  <span className="font-bold text-slate-600">Chr 5q13.3</span>
                  <div className="text-slate-600">HEXB</div>
                  <div className="text-slate-400 text-[10px]">Sandhoff</div>
                </div>
                <div className="bg-white rounded p-2 border">
                  <span className="font-bold text-slate-600">Chr 2p11.2</span>
                  <div className="text-slate-600">ST3GAL5</div>
                  <div className="text-slate-400 text-[10px]">GM3 synthase</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{defaultLabels.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{defaultLabels.subtitle}</p>
          </div>
          
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-lg gap-1">
            <button 
              onClick={() => setMode('synthesis')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'synthesis' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              {defaultLabels.biosynthesis}
            </button>
            <button 
              onClick={() => setMode('degradation')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'degradation' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {defaultLabels.degradation}
            </button>
            <button 
              onClick={() => setMode('pathogens')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'pathogens' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Bug className="w-3.5 h-3.5" />
              {defaultLabels.pathogens}
            </button>
            <button 
              onClick={() => setMode('viruses')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'viruses' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Dna className="w-3.5 h-3.5" />
              {defaultLabels.viruses}
            </button>
            <button 
              onClick={() => setMode('storage')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'storage' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {defaultLabels.storage}
            </button>
            <button 
              onClick={() => setMode('autoimmune')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'autoimmune' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              {defaultLabels.autoimmune}
            </button>
            <button 
              onClick={() => setMode('tumors')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'tumors' ? 'bg-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              {defaultLabels.tumors}
            </button>
            <button 
              onClick={() => setMode('genetics')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${mode === 'genetics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {defaultLabels.genetics}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
           <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded bg-slate-200 border border-slate-400"></span> Precursors
           </div>
           <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> a-series
           </div>
           <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span> b-series
           </div>
           <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span> c-series
           </div>
           {mode === 'pathogens' && (
             <>
               <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-300">
                 <span className="w-3 h-3 rounded bg-purple-600"></span> Bacterial toxin
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded bg-orange-500"></span> Molecular mimicry
               </div>
             </>
           )}
           {mode === 'viruses' && (
             <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-300">
               <span className="w-3 h-3 rounded bg-pink-600"></span> Viral receptor
             </div>
           )}
           {mode === 'storage' && (
             <>
               <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-300">
                 <span className="w-3 h-3 rounded bg-red-700"></span> Severe (infantile)
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded bg-orange-600"></span> Variable severity
               </div>
             </>
           )}
           {mode === 'autoimmune' && (
             <>
               <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-300">
                 <span className="w-3 h-3 rounded bg-cyan-600"></span> Acute (GBS/MFS)
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded bg-teal-600"></span> Chronic (MMN/CANOMAD)
               </div>
             </>
           )}
           {mode === 'tumors' && (
             <>
               <div className="flex items-center gap-2 ml-2 border-l pl-4 border-slate-300">
                 <span className="w-3 h-3 rounded bg-fuchsia-700 ring-2 ring-red-400"></span> B-series (worse prognosis)
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded bg-green-600"></span> A-series (protective)
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded bg-fuchsia-400"></span> Variable
               </div>
             </>
           )}
           <div className="ml-auto flex items-center gap-2 font-medium">
             <Info className="w-4 h-4" /> {defaultLabels.hoverInfo}
           </div>
        </div>

        {/* Map Container */}
        <div className="p-8 overflow-x-auto">
          <div className="relative min-w-[700px] grid grid-cols-4 gap-x-12 gap-y-12 place-items-center">
            
            {/* Column Headers */}
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">0-Series</div>
            <div className="text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">a-Series</div>
            <div className="text-red-900 text-xs font-bold uppercase tracking-wider mb-2">b-Series</div>
            <div className="text-green-900 text-xs font-bold uppercase tracking-wider mb-2">c-Series</div>

            {/* Render Nodes */}
            {GRID_NODES.map((node) => {
              const style: React.CSSProperties = {
                gridColumn: node.colSpan ? `1 / span ${node.colSpan}` : node.col + 1,
                gridRow: node.row + 2
              };

              const outgoingConnections = PATHWAYS.filter(p => p.from === node.id);
              const bindingResult = getBindingsForNode(node.id);
              const isHighlighted = 'highlight' in node && node.highlight;
              const isKeyStep = 'keyStep' in node && node.keyStep;
              const hasBindings = bindingResult.data.length > 0;

              // Determine ring color based on mode
              const getRingColor = () => {
                if (!hasBindings) return '';
                switch (mode) {
                  case 'pathogens': return 'ring-2 ring-offset-1 ring-purple-400';
                  case 'viruses': return 'ring-2 ring-offset-1 ring-pink-400';
                  case 'storage': return 'ring-2 ring-offset-1 ring-orange-400';
                  case 'autoimmune': return 'ring-2 ring-offset-1 ring-cyan-400';
                  case 'tumors': return 'ring-2 ring-offset-1 ring-fuchsia-400';
                  default: return '';
                }
              };

              return (
                <div key={node.id} style={style} className="relative w-full flex justify-center">
                  
                  {/* The Node Block */}
                  <div 
                    className={`
                      relative z-10 w-32 h-14 flex flex-col items-center justify-center 
                      rounded shadow-sm border-2 text-sm font-bold transition-transform hover:scale-105
                      ${SERIES_COLORS[node.series as keyof typeof SERIES_COLORS]}
                      ${isKeyStep ? 'ring-2 ring-amber-300 ring-offset-1' : ''}
                      ${isHighlighted ? 'animate-pulse-glow border-amber-500 border-[3px]' : ''}
                      ${getRingColor()}
                    `}
                  >
                    {node.label}
                    {isHighlighted && (
                      <span className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg animate-bounce">
                        ★ KEY
                      </span>
                    )}
                    {isKeyStep && (
                      <span className="absolute -top-2 -left-2 bg-amber-300 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        6p21
                      </span>
                    )}
                    {node.series !== 'precursor' && (
                       <span className="text-[9px] font-normal opacity-70">
                         {node.series === 'o' ? 'Asialo' : node.series === 'a' ? 'Mono-sia' : node.series === 'b' ? 'Di-sia' : 'Tri-sia'}
                       </span>
                    )}
                  </div>

                  {/* Render metabolic connections */}
                  {(mode === 'synthesis' || mode === 'degradation') && outgoingConnections.map((conn, idx) => (
                    <Connection 
                      key={`${conn.from}-${conn.to}-${idx}`}
                      type={conn.type}
                      enzyme={conn.enzyme}
                      enzymeName={conn.name}
                      mode={conn.mode as 'synthesis' | 'degradation'}
                      currentMode={mode}
                    />
                  ))}

                  {/* Render binding tags based on mode */}
                  {hasBindings && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full flex flex-wrap gap-1 justify-center max-w-[150px] z-20">
                      {bindingResult.type === 'pathogen' && bindingResult.data.map((binding: any, idx: number) => (
                        <PathogenTag
                          key={idx}
                          pathogen={binding.pathogen}
                          organism={binding.organism}
                          affinity={binding.affinity}
                          disease={binding.disease}
                          notes={binding.notes}
                          isVirus={false}
                        />
                      ))}
                      {bindingResult.type === 'virus' && bindingResult.data.map((binding: any, idx: number) => (
                        <PathogenTag
                          key={idx}
                          pathogen={binding.pathogen}
                          organism={binding.organism}
                          affinity={binding.affinity}
                          disease={binding.disease}
                          notes={binding.notes}
                          isVirus={true}
                        />
                      ))}
                      {bindingResult.type === 'storage' && bindingResult.data.map((binding: any, idx: number) => (
                        <StorageTag
                          key={idx}
                          disease={binding.disease}
                          gene={binding.gene}
                          enzyme={binding.enzyme}
                          inheritance={binding.inheritance}
                          prevalence={binding.prevalence}
                          notes={binding.notes}
                        />
                      ))}
                      {bindingResult.type === 'autoimmune' && bindingResult.data.map((binding: any, idx: number) => (
                        <AutoimmuneTag
                          key={idx}
                          disease={binding.disease}
                          antibody={binding.antibody}
                          clinicalFeatures={binding.clinicalFeatures}
                          trigger={binding.trigger}
                          prognosis={binding.prognosis}
                          notes={binding.notes}
                        />
                      ))}
                      {bindingResult.type === 'tumor' && bindingResult.data.map((binding: any, idx: number) => (
                        <TumorTag
                          key={idx}
                          tumor={binding.tumor}
                          expression={binding.expression}
                          therapeuticTarget={binding.therapeuticTarget}
                          drug={binding.drug}
                          prognosis={binding.prognosis}
                          notes={binding.notes}
                        />
                      ))}
                    </div>
                  )}
                  
                </div>
              );
            })}

          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 text-slate-500 text-sm">
          <h4 className="font-bold text-slate-700 mb-2">{defaultLabels.clinicalRelevance}</h4>
          {getFooterContent()}
        </div>

      </div>
    </div>
  );
}
