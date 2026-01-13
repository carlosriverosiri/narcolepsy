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
  // Level 0: Precursors (positioned between columns 0-1 for clearer branching)
  { id: 'cer', label: 'Ceramide', series: 'precursor', row: 0, col: 0, colSpan: 2 },
  { id: 'glccer', label: 'GlcCer', series: 'precursor', row: 1, col: 0, colSpan: 2 },
  { id: 'laccer', label: 'LacCer', series: 'precursor', row: 2, col: 0, colSpan: 2 },
  
  // Level 1: Initiation of series (the "fork" from LacCer)
  // ┌──────────────────────────────────────────────────────────────┐
  // │  LacCer branches to ALL 4 series:                           │
  // │  • B4GALNT1 → GA2 (O-series, asialo)                        │
  // │  • ST3GAL5  → GM3 (A-series) → ST8SIA1 → GD3 (B-series)     │
  // │                               → ST8SIA5 → GT3 (C-series)     │
  // └──────────────────────────────────────────────────────────────┘
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
  { from: 'laccer', to: 'ga2', type: 'branch-left', mode: 'synthesis', enzyme: 'B4GALNT1', name: 'GA2/GM2 Synthase' }, 
  { from: 'laccer', to: 'gm3', type: 'branch-right', mode: 'synthesis', enzyme: 'ST3GAL5', name: 'GM3 Synthase' }, 
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
  // Pseudomonas aeruginosa - binds asialo-gangliosides (Krivan et al. 1988)
  { 
    target: 'ga1', 
    pathogen: 'P. aeruginosa',
    organism: 'Pseudomonas aeruginosa',
    affinity: 'high',
    disease: 'Respiratory infections / Cystic fibrosis',
    notes: 'Pili bind βGalNAc(1-4)βGal on asialo-GM1. Critical for CF lung colonization! [PMID: 3124753, 7910938]'
  },
  { 
    target: 'ga2', 
    pathogen: 'P. aeruginosa',
    organism: 'Pseudomonas aeruginosa',
    affinity: 'high',
    disease: 'Respiratory infections / Cystic fibrosis',
    notes: 'Also binds asialo-GM2. LPS is additional adhesin. CF patients have increased asialo-gangliosides! [PMID: 7927723]'
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
    notes: '⚠️ GM3 is ESSENTIAL for cochlear hair cells! A speculative hypothesis linked H3N2/GM3 to "Havana Syndrome" — but this has been CRITICALLY EVALUATED and found UNLIKELY (see /speculation/havana-syndrome/).'
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
  // Merkel cell polyomavirus (MCPyV) - GT1b primary receptor
  { 
    target: 'gt1b', 
    pathogen: 'MCPyV',
    organism: 'Merkel cell polyomavirus',
    affinity: 'high',
    disease: 'Merkel cell carcinoma (MCC)',
    notes: 'VP1 binds GT1b via sialic acids on both branches. Initial attachment via GAGs, then GT1b as co-receptor for entry. Explains tropism for Merkel cells (rich in complex gangliosides). [Erickson 2009, DOI: 10.1128/JVI.00949-09]'
  },
  { 
    target: 'gd1a', 
    pathogen: 'MCPyV',
    organism: 'Merkel cell polyomavirus',
    affinity: 'medium',
    disease: 'Merkel cell carcinoma',
    notes: 'Alternative sialylated receptor. MCPyV binds broader sialylated oligosaccharides (3SLN, DSL, GD1a). [Ströh & Tsai 2014, DOI: 10.1016/j.coviro.2014.06.003]'
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
  // SARS-CoV-2 → GM1/GM2/GM3 → COVID-19 (Nguyen et al. 2021, Nature Chem Biol)
  { 
    target: 'gm3', 
    pathogen: 'SARS-CoV-2',
    organism: 'SARS-CoV-2 (COVID-19)',
    affinity: 'high',
    disease: 'COVID-19 / Long COVID?',
    notes: 'RBD binds GM3 in lipid rafts (Kd ~160-200 μM). Depleting glycolipids REDUCES viral entry. May explain neurological symptoms — gangliosides 10-30× higher in brain! [Nguyen et al. 2021 Nature Chem Biol]'
  },
  { 
    target: 'gm1a', 
    pathogen: 'SARS-CoV-2',
    organism: 'SARS-CoV-2 (COVID-19)',
    affinity: 'high',
    disease: 'COVID-19 / GBS / CNS invasion',
    notes: 'GM1 is TOP HIT for RBD binding (Kd ~160 μM)! Monosialylated gangliosides preferred. Post-COVID GBS reported. Gangliosides may mediate CNS invasion. [Nguyen et al. 2021 Nature Chem Biol]'
  },
  { 
    target: 'gm2', 
    pathogen: 'SARS-CoV-2',
    organism: 'SARS-CoV-2 (COVID-19)',
    affinity: 'high',
    disease: 'COVID-19',
    notes: 'GM2 is second-highest affinity ganglioside for SARS-CoV-2 RBD after GM1. Monosialylated gangliosides preferred over di/tri-sialylated. [Nguyen et al. 2021 Nature Chem Biol]'
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
  
  // ═══════════════════════════════════════════════════════════════════════════
  // O-SERIES (ASIALO): Incomplete synthesis / sialidase overexpression
  // These appear when cells LOSE ability to add sialic acid (aberrant glycosylation)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    target: 'ga1',
    tumor: 'Small Cell Lung Cancer (SCLC)',
    expression: 'very_high',
    therapeuticTarget: true,
    drug: 'Anti-asialo-GM1 immunotherapy',
    prognosis: 'poor',
    notes: '🫁 STRONGEST O-SERIES LINK! Asialo-GM1 highly expressed on SCLC but ABSENT in normal lung tissue. Ideal immunotherapy target! [Hayakawa 2016]'
  },
  {
    target: 'ga1',
    tumor: 'Metastatic tumors (liver)',
    expression: 'high',
    therapeuticTarget: false,
    drug: 'Prognostic marker',
    prognosis: 'poor',
    notes: '⚠️ High asialo-GM1 correlates with LIVER METASTASIS in lymphoma, lung cancer. Neutral charge affects cell-matrix adhesion.'
  },
  {
    target: 'ga1',
    tumor: 'NK cell target marker',
    expression: 'variable',
    therapeuticTarget: false,
    drug: 'NK cell-based therapy',
    prognosis: 'variable',
    notes: '🛡️ NK cells recognize asialo-GM1! Used as NK cell marker (anti-asialo-GM1 depletes NK cells in research). Tumor asialo-GM1 → NK susceptibility.'
  },
  {
    target: 'ga2',
    tumor: 'Neuroblastoma',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'GA2 accumulation indicates "blockade" at ST3GAL5 step. Incomplete synthesis → primitive phenotype. [Svennerholm studies]'
  },
  {
    target: 'ga2',
    tumor: 'Sarcoma',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'Similar to neuroblastoma — asialo-gangliosides indicate dedifferentiation. GA2 is normally rapidly processed to GM3.'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C-SERIES (TRI-SIALO): Oncofetal reactivation / "Fish gangliosides"
  // These appear when EMBRYONAL gene expression is reactivated (retrogression)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    target: 'gt3',
    tumor: 'Glioblastoma (GBM)',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'A2B5-targeted therapy',
    prognosis: 'poor',
    notes: '🧠 C-SERIES PATHWAY REACTIVATED! GT3 correlates with A2B5 epitope = glioma STEM CELLS. Responsible for recurrence & radiation resistance! [Stiles 2008]'
  },
  {
    target: 'gt3',
    tumor: 'Melanoma (stem cells)',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'GT3+ cells show cancer stem cell properties. ST8SIA1 reactivation drives c-series synthesis in aggressive melanomas.'
  },
  {
    target: 'gt2',
    tumor: 'Glioblastoma',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'Part of c-series pathway reactivation. GT2 intermediate accumulates during aberrant polysialo synthesis.'
  },
  {
    target: 'gt1c',
    tumor: 'High-grade glioma',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'Downstream c-series product. Expression correlates with tumor grade and stem cell phenotype.'
  },
  {
    target: 'gq1c',
    tumor: 'Adult T-cell Leukemia (ATL)',
    expression: 'high',
    therapeuticTarget: true,
    drug: 'Anti-GD1c/GQ1c antibodies',
    prognosis: 'poor',
    notes: '🦠 HTLV-1 SPECIFIC! GD1c/GQ1c (c-series) expressed on ATL cells but NOT on normal T-cells. Potential biomarker & therapy target! [Yamaguchi 2009, Glycobiology]'
  },
  {
    target: 'gq1c',
    tumor: 'Breast cancer (stem cells)',
    expression: 'elevated',
    therapeuticTarget: false,
    drug: 'Research stage',
    prognosis: 'poor',
    notes: 'C-series found in stem-like breast cancer populations. ST8SIA1-driven synthesis indicates dedifferentiation.'
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
    { gene: 'ST8SIA1', chromosome: '12p12.1', enzyme: 'GD3 Synthase', product: 'GD3', notes: '🔑 "GATEKEEPER" — massively OVEREXPRESSED in glioblastoma! Creates GD3 pool for C-series [Tringali 2014]' },
    { gene: 'ST8SIA5', chromosome: '18q21.1', enzyme: 'GT3 Synthase', product: 'GT3', notes: '🔑 "ARCHITECT" — REACTIVATED in glioma stem cells! Initiates C-series. Knockdown → loss of stemness [Yeh 2016]' },
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
  
  // Vertical arrows - just arrow symbol, no line
  if (type === 'vertical') {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-20 flex flex-col items-center" style={{ marginTop: '0.25rem' }}>
        <div className="text-emerald-600 text-3xl font-bold leading-none">↓</div>
        <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
      </div>
    );
  } else if (type === 'vertical-up') {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full z-20 flex flex-col items-center" style={{ marginBottom: '0.25rem' }}>
        <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
        <div className="text-rose-600 text-3xl font-bold leading-none">↑</div>
      </div>
    );
  } else if (type === 'horizontal') {
    // Horizontal arrow to the RIGHT (GM3→GD3, GD3→GT3) - just arrow, no line
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-full z-30 flex flex-col items-center" style={{ width: '48px' }}>
        <div className="text-emerald-600 text-3xl font-bold leading-none">→</div>
        <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
      </div>
    );
  } else if (type === 'horizontal-back') {
    // Horizontal arrow to the LEFT (degradation: GD3→GM3) - just arrow, no line
    return (
      <div className="absolute top-1/2 -translate-y-1/2 right-full z-30 flex flex-col items-center" style={{ width: '48px' }}>
        <div className="text-rose-600 text-3xl font-bold leading-none">←</div>
        <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
      </div>
    );
  } else if (type === 'branch-left') {
     // LacCer → GA2 (positioned directly above GA2, centered)
     return (
       <div className="absolute top-full left-1/4 -translate-x-1/2 z-20 flex flex-col items-center" style={{ marginTop: '0.5rem' }}>
          <div className="text-emerald-600 text-3xl font-bold leading-none">↓</div>
          <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
       </div>
     );
  } else if (type === 'branch-right') {
     // LacCer → GM3 (positioned directly above GM3, centered)
     return (
       <div className="absolute top-full right-1/4 translate-x-1/2 z-20 flex flex-col items-center" style={{ marginTop: '0.5rem' }}>
          <div className="text-emerald-600 text-3xl font-bold leading-none">↓</div>
          <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
       </div>
     );
  } else if (type === 'right-branch') {
     // Generic diagonal right branch
     return (
       <div className="absolute top-full right-0 z-20" style={{ marginTop: '0.25rem' }}>
         <div className="flex flex-col items-center">
            <div className="text-emerald-500 text-lg leading-none">↘</div>
            <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
         </div>
       </div>
     );
  } else if (type === 'right-branch-back') {
     return (
       <div className="absolute bottom-full right-0 z-20" style={{ marginBottom: '0.25rem' }}>
         <div className="flex flex-col items-center">
            <EnzymeTag code={enzyme} name={enzymeName} colorClass={colorClass} isAnimated={isKeyEnzyme} />
            <div className="text-rose-500 text-lg leading-none">↗</div>
         </div>
       </div>
     );
  }

  // Fallback for unknown connection types
  return null;
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
  const [showDeepDive, setShowDeepDive] = useState(false);

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
              <li><strong className="text-teal-600">P. aeruginosa → Asialo-GM1/GM2:</strong> Pili-mediated adhesion. Critical in cystic fibrosis!</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <h5 className="font-bold text-teal-800 text-sm mb-1">🫁 Pseudomonas aeruginosa — Cystic Fibrosis</h5>
                <p className="text-teal-700 text-xs mb-2">
                  <strong>P. aeruginosa</strong> binds <strong>asialo-GM1 (GA1)</strong> and <strong>asialo-GM2 (GA2)</strong> 
                  via pili (βGalNAc(1-4)βGal epitope). This is critical for lung colonization in cystic fibrosis (CF).
                </p>
                <ul className="text-teal-700 text-[11px] space-y-1">
                  <li>• CF patients have <strong>increased asialo-gangliosides</strong> in airway epithelium</li>
                  <li>• CFTR dysfunction → reduced sialylation → more binding sites</li>
                  <li>• Both pili AND LPS act as adhesins (<a href="https://pubmed.ncbi.nlm.nih.gov/7927723/" className="text-teal-600 underline" target="_blank">PMID: 7927723</a>)</li>
                  <li>• Key refs: <a href="https://pubmed.ncbi.nlm.nih.gov/3124753/" className="text-teal-600 underline" target="_blank">Krivan 1988</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/7910938/" className="text-teal-600 underline" target="_blank">Lee 1994</a></li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'viruses':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <h5 className="font-bold text-pink-800 text-sm mb-2">🧠 H1N1 → GT1b/GD1a → CNS</h5>
                <ul className="text-pink-700 text-xs space-y-1">
                  <li>• HA binds sialic acid on GT1b/GD1a</li>
                  <li>• NA cleaves GT1b → GD1b</li>
                  <li>• <strong>Pandemrix 2009 → Narcolepsy</strong></li>
                  <li>• Target: Orexin cells in hypothalamus</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <h5 className="font-bold text-emerald-800 text-sm mb-2">🦠 SARS-CoV-2 → GM1/GM2/GM3</h5>
                <ul className="text-emerald-700 text-xs space-y-1">
                  <li>• RBD binds <strong>GM1 (top hit!)</strong>, GM2, GM3</li>
                  <li>• Kd ~160 μM (similar to other ganglioside-binding viruses)</li>
                  <li>• Depleting glycolipids <strong>REDUCES viral entry</strong></li>
                  <li>• Brain has <strong>10-30× more gangliosides</strong> → CNS invasion?</li>
                  <li>• Post-COVID <strong>GBS</strong>, Long COVID neuropathy</li>
                </ul>
                <p className="text-emerald-600 text-[10px] mt-1 italic">Nguyen et al. 2021, Nature Chem Biol</p>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                <h5 className="font-bold text-slate-700 text-sm mb-2">👂 H3N2 → GM3 <span className="text-red-600 text-xs">(Unlikely)</span></h5>
                <ul className="text-slate-600 text-xs space-y-1">
                  <li>• HA binds GM3 with high affinity</li>
                  <li>• GM3 essential for cochlear hair cells</li>
                  <li>• <a href="/speculation/havana-syndrome/" className="text-red-600 underline">Havana hypothesis → UNLIKELY</a></li>
                </ul>
              </div>
            </div>
            <div className="bg-slate-100 border-l-4 border-slate-400 p-3">
              <h5 className="font-bold text-slate-800 text-sm mb-1">🔬 Gangliosides Determine Disease Pattern</h5>
              <p className="text-slate-700 text-xs">
                <strong>Different viruses → Different gangliosides → Different symptoms:</strong> 
                H1N1 (GT1b) → brain/narcolepsy. SARS-CoV-2 (GM3/GM1) → multi-organ/Long COVID. 
                Gangliosides determine which cells are affected — this "hidden" system explains 
                why viruses cause such varied neurological manifestations.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Polyomavirus (JC, BK):</strong> GT1b/GD1b → neurotropism → PML</li>
              <li><strong>SV40 → GM1:</strong> Classic model for ganglioside-mediated virus uptake</li>
              <li><strong>SARS-CoV-2 → GM1/GM2/GM3:</strong> Monosialylated gangliosides facilitate viral entry. Glycolipid depletion reduces infection (<a href="https://doi.org/10.1038/s41589-021-00924-1" className="text-blue-600 underline" target="_blank">Nguyen et al. 2021</a>)</li>
            </ul>
          </div>
        );
      case 'storage':
        return (
          <div className="space-y-3">
            {/* Header */}
            <div className="text-center bg-slate-100 rounded-lg p-2">
              <h4 className="font-bold text-slate-800 text-sm">The Great Divide: Stagnation vs. Flux</h4>
              <p className="text-slate-600 text-xs">Nature has divided gangliosides into two functional tracks based on their destination</p>
            </div>

            {/* Comprehensive comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-300 p-2 text-left text-slate-700">Property</th>
                    <th className="border border-slate-300 p-2 text-center bg-blue-100 text-blue-800">🔒 A-SERIES (GM1, GM2)</th>
                    <th className="border border-slate-300 p-2 text-center bg-red-100 text-red-800">🚀 B-SERIES (GT1b, GD1b)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">Primary Domain</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50 text-blue-700">Intracellular / Lysosomal</td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50 text-red-700">Extracellular / Synaptic</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">Turnover</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50 text-blue-700">Endocytosis → Degradation</td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50 text-red-700">Shedding (EVs) → Signaling</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">When Enzymes Fail</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50 text-blue-700">Massive accumulation <br/><span className="text-[10px]">("Garbage piles")</span></td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50 text-red-700">No accumulation <br/><span className="text-[10px]">(Shedding "ventilates")</span></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">Clinical Picture</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50"><span className="font-bold text-blue-800">Storage diseases!</span><br/><span className="text-blue-600 text-[10px]">Tay-Sachs, Sandhoff, GM1</span></td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50"><span className="font-bold text-red-800">No storage diseases!</span><br/><span className="text-red-600 text-[10px]">But: GBS, autoimmunity</span></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">Toxin Model</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50"><strong className="text-blue-800">Cholera toxin:</strong><br/><span className="text-blue-600 text-[10px]">Acts INSIDE the cell</span></td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50"><strong className="text-red-800">Tetanus toxin:</strong><br/><span className="text-red-600 text-[10px]">JUMPS between cells (trans-synaptic)</span></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-700">Metaphor</td>
                    <td className="border border-slate-300 p-2 text-center bg-blue-50 text-blue-700 font-bold">"Dead End"<br/><span className="text-[10px] font-normal">Requires lysosomal cleanup</span></td>
                    <td className="border border-slate-300 p-2 text-center bg-red-50 text-red-700 font-bold">"Highway"<br/><span className="text-[10px] font-normal">Traffic flows OUT of the cell</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Critical Insight - The Escape Valve */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg p-4">
              <h5 className="font-bold text-amber-900 text-sm mb-2">🔑 The Escape Valve Hypothesis</h5>
              <p className="text-amber-800 text-xs italic mb-3">
                "The striking absence of specific 'GT1b storage diseases' suggests an evolutionary divergence. 
                While A-series gangliosides are destined for the lysosomal 'incinerator' (where defects cause disaster), 
                B-series gangliosides possess a biological <strong>'escape valve'</strong>. They are packaged into 
                Extracellular Vesicles (EVs) or shed at the synapse to modulate the environment, 
                <strong> bypassing the lysosomal burden entirely</strong>."
              </p>
              <div className="bg-white rounded p-3 text-xs border border-amber-200">
                <p className="text-slate-700 font-semibold mb-2">Mechanistic Evidence:</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• <strong>Retrograde Transport & Exocytosis:</strong> GT1b acts as a molecular "address label" directing cargo from nerve terminals toward the cell body — but also OUT to neighboring cells</li>
                  <li>• <strong>Shedding as Defense:</strong> By continuously "shedding" B-series gangliosides (like a snake sheds skin), the neuron avoids becoming an immune target while communicating with glia</li>
                  <li>• <strong>A-series lacks this mechanism:</strong> Without active exocytosis, A-series gets trapped in the lysosomal "incinerator"</li>
                </ul>
              </div>
            </div>

            {/* Counter-argument box */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
              <h5 className="font-bold text-slate-700 text-xs mb-1">⚖️ Potential Counter-argument (and why it fails):</h5>
              <p className="text-slate-600 text-[11px]">
                <strong>Critic:</strong> "But the enzyme that degrades GT1b (sialidase) produces GD1b... if that enzyme fails, shouldn't we see B-series accumulation?"
              </p>
              <p className="text-slate-700 text-[11px] mt-1">
                <strong>Answer:</strong> Clinically, we do NOT see massive accumulation of complex B-gangliosides (like GT1b) the way we see "garbage piles" of GM1/GM2. 
                This indicates GT1b/GD1b have an <strong>alternative turnover pathway</strong> — they "disappear" from the system (shedding/signaling) 
                before reaching the lysosome in significant quantities.
              </p>
            </div>

            {/* Precursor diseases note */}
            <div className="text-xs text-slate-500">
              <strong>Also note:</strong> Precursor diseases (Gaucher, Krabbe) affect shared pathway components, not series-specific gangliosides.
            </div>

            {/* The Cargo: Neurotrophins on the B-series Express */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <h5 className="font-bold text-emerald-800 text-sm mb-2">🚂 The Cargo: What Travels on the B-Series Express?</h5>
              <p className="text-emerald-700 text-xs mb-2">
                If B-series gangliosides are "designed" for communication and transport, what cargo do they carry? 
                Key neurotrophic factors depend on GT1b/GD1b for their signaling:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
                <div className="bg-white rounded p-2 border border-emerald-100">
                  <p className="font-bold text-emerald-700">GDNF</p>
                  <p className="text-slate-600">Critical for dopaminergic neuron survival (Parkinson's). Requires GD1b/GT1b-rich lipid rafts for signaling via GFRα1/RET complex.</p>
                  <p className="text-emerald-600 text-[9px] mt-1"><a href="https://pubmed.ncbi.nlm.nih.gov/12671643/" target="_blank" className="hover:underline">Sariola & Saarma 2003</a></p>
                </div>
                <div className="bg-white rounded p-2 border border-emerald-100">
                  <p className="font-bold text-emerald-700">BDNF</p>
                  <p className="text-slate-600">Brain's key plasticity factor. GT1b is required for TrkB receptor dimerization and activation. Can be shed in exosomes together with gangliosides!</p>
                  <p className="text-emerald-600 text-[9px] mt-1"><a href="https://pubmed.ncbi.nlm.nih.gov/21325515/" target="_blank" className="hover:underline">Lim et al. 2011</a></p>
                </div>
                <div className="bg-white rounded p-2 border border-emerald-100">
                  <p className="font-bold text-emerald-700">MAG Signaling</p>
                  <p className="text-slate-600">Myelin-associated glycoprotein binds GT1b/GD1a on axons. <strong>Proves GT1b is exposed extracellularly</strong> — not locked inside!</p>
                  <p className="text-emerald-600 text-[9px] mt-1"><a href="https://pubmed.ncbi.nlm.nih.gov/18623174/" target="_blank" className="hover:underline">Schnaar & Lopez 2009</a></p>
                </div>
              </div>
              <div className="bg-emerald-100 rounded p-2 mt-2 text-[10px]">
                <strong className="text-emerald-800">🔑 Signaling Endosomes:</strong>
                <span className="text-emerald-700"> When neurons receive neurotrophins (NGF, BDNF), the receptor complex is internalized into 
                "signaling endosomes" that travel retrogradely to the nucleus with the message "Survive!". 
                <strong> GT1b is a critical membrane component</strong> of these endosomes, protecting the receptor from degradation during transport.</span>
              </div>
            </div>

            {/* Scientific Nuances - Addressing Complexity */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
              <h5 className="font-bold text-slate-700 text-sm mb-2">⚖️ Scientific Nuances: It's Not Black and White</h5>
              <p className="text-slate-600 text-xs italic mb-2">
                While the A-series/B-series division offers a powerful functional model, biological reality involves complex interplay. 
                Here we address potential counter-arguments:
              </p>
              
              <div className="space-y-2 text-[10px]">
                {/* Counter-argument 1 */}
                <div className="bg-white rounded p-2 border-l-4 border-amber-400">
                  <p className="font-semibold text-amber-800">1. The Metabolic Funnel ("Sink Effect")</p>
                  <p className="text-slate-600">
                    <strong>Criticism:</strong> GM1/GM2 accumulation may simply be because they're the "final common pathway" — 
                    GT1b → GD1a → GM1. A blockage at GM1 traps everything upstream.
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Our response:</strong> Defects in <em>upstream</em> B-series enzymes rarely cause fatal storage phenotypes 
                    compared to downstream defects. This implies the cell handles B-series intermediates better — via shedding or rapid conversion.
                    <span className="text-slate-500"> [<a href="https://pubmed.ncbi.nlm.nih.gov/22247170/" target="_blank" className="text-blue-600 hover:underline">Miyagi & Yamaguchi 2012</a>]</span>
                  </p>
                </div>

                {/* Counter-argument 2 */}
                <div className="bg-white rounded p-2 border-l-4 border-blue-400">
                  <p className="font-semibold text-blue-800">2. GM1 is Not Just "Waste"</p>
                  <p className="text-slate-600">
                    <strong>Criticism:</strong> GM1 performs critical surface signaling (lipid rafts, Ca²⁺ regulation). 
                    Anti-GM1 antibodies cause GBS — proving GM1 is <em>exposed</em>, not just intracellular.
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Our response:</strong> We don't deny GM1's surface role. We emphasize its <em>pathological fate</em>: 
                    when turnover fails, GM1 is trapped in lysosomes, while GT1b has an "escape route" via EVs.
                    <span className="text-slate-500"> [<a href="https://pubmed.ncbi.nlm.nih.gov/25680450/" target="_blank" className="text-blue-600 hover:underline">Ledeen & Wu 2015</a>]</span>
                  </p>
                </div>

                {/* Counter-argument 3 */}
                <div className="bg-white rounded p-2 border-l-4 border-rose-400">
                  <p className="font-semibold text-rose-800">3. The Exception: Sialidosis</p>
                  <p className="text-slate-600">
                    <strong>Criticism:</strong> Sialidosis (NEU1 deficiency) blocks B-series degradation at the top of the chain — 
                    and <em>does</em> cause pathological accumulation. Shedding isn't 100% effective!
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Our response:</strong> True — the "shedding valve" has limits. But the prevalence and severity of 
                    A-series diseases (Tay-Sachs, GM1) <em>vastly overshadows</em> these rarer upstream defects, 
                    reinforcing A-series as the primary vulnerability.
                    <span className="text-slate-500"> [<a href="https://pubmed.ncbi.nlm.nih.gov/14641227/" target="_blank" className="text-blue-600 hover:underline">Seyrantepe et al. 2003</a>]</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-200 rounded p-2 mt-2 text-[10px] text-slate-700">
                <strong>Bottom line:</strong> Regardless of the exact mechanism (enzymatic speed vs. shedding), 
                the functional outcome remains distinct: <em>The nervous system tolerates B-series fluctuations better than A-series blockades.</em>
              </div>
            </div>

            {/* References */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2">
              <h5 className="font-bold text-slate-700 text-xs mb-2">📚 Key References</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-600">A-series vs B-series Trafficking:</p>
                  <p className="text-slate-500">
                    • <a href="https://doi.org/10.1083/jcb.200107096" target="_blank" className="text-blue-600 hover:underline">Lalli & Schiavo (2002)</a> — Tetanus vs Cholera transport. <em>J Cell Biol</em>
                  </p>
                  <p className="text-slate-500">
                    • <a href="https://www.mdpi.com/1422-0067/23/16/9441" target="_blank" className="text-blue-600 hover:underline">Izquierdo et al. (2022)</a> — Gangliosides in EVs. <em>MDPI</em>
                  </p>
                  <p className="text-slate-500">
                    • <a href="https://pubmed.ncbi.nlm.nih.gov/23709688/" target="_blank" className="text-blue-600 hover:underline">Sonnino & Prinetti (2013)</a> — Lipid rafts & shedding. <em>Curr Opin Chem Biol</em>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-600">Storage & Counter-arguments:</p>
                  <p className="text-slate-500">
                    • <a href="https://pubmed.ncbi.nlm.nih.gov/23825417/" target="_blank" className="text-blue-600 hover:underline">Sandhoff & Harzer (2013)</a> — Gangliosidoses review. <em>J Inher Metab Dis</em>
                  </p>
                  <p className="text-slate-500">
                    • <a href="https://pubmed.ncbi.nlm.nih.gov/25680450/" target="_blank" className="text-blue-600 hover:underline">Ledeen & Wu (2015)</a> — GM1 surface roles. <em>TIBS</em>
                  </p>
                  <p className="text-slate-500">
                    • <a href="https://pubmed.ncbi.nlm.nih.gov/22247170/" target="_blank" className="text-blue-600 hover:underline">Miyagi & Yamaguchi (2012)</a> — Sialidase dynamics. <em>Glycobiology</em>
                  </p>
                </div>
              </div>
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

            {/* O-series and C-series - the "silent" series in tumors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                <h5 className="font-bold text-slate-700 text-sm mb-2">🫁 O-SERIES (ASIALO) → INCOMPLETE SYNTHESIS</h5>
                <p className="text-slate-600 text-[11px] mb-2 italic">
                  Appears when cells lose sialic acid addition (sialyltransferase loss or sialidase overexpression)
                </p>
                <ul className="text-slate-700 text-xs space-y-1">
                  <li>• <strong>GA1 (asialo-GM1)</strong> → <strong className="text-red-600">Small Cell Lung Cancer (SCLC)</strong> — STRONGEST LINK!</li>
                  <li>• Absent in normal lung tissue = <strong>ideal immunotherapy target</strong></li>
                  <li>• High GA1 correlates with <strong>liver metastasis</strong> (lymphoma, lung)</li>
                  <li>• GA2 accumulates in <strong>neuroblastoma, sarcoma</strong></li>
                  <li>• 🛡️ NK cells recognize asialo-GM1 → tumor susceptibility</li>
                </ul>
                <p className="text-slate-500 text-[10px] mt-2">
                  Refs: <a href="https://pubmed.ncbi.nlm.nih.gov/" className="text-blue-600 underline" target="_blank">Hayakawa 2016</a>, Svennerholm (pioneer)
                </p>
              </div>
              <div className="bg-violet-50 border border-violet-300 rounded-lg p-3">
                <h5 className="font-bold text-violet-700 text-sm mb-2">🐟 C-SERIES (TRI-SIALO) → ONCOFETAL REACTIVATION</h5>
                <p className="text-violet-600 text-[11px] mb-2 italic">
                  "Fish gangliosides" reappear when embryonal gene expression is reactivated (retrogression)
                </p>
                <ul className="text-violet-700 text-xs space-y-1">
                  <li>• <strong>GT3</strong> → <strong className="text-red-600">Glioblastoma stem cells</strong> (A2B5 epitope)</li>
                  <li>• Responsible for <strong>recurrence & radiation resistance</strong></li>
                  <li>• <strong>GD1c/GQ1c</strong> → <strong className="text-red-600">Adult T-cell Leukemia (HTLV-1)</strong></li>
                  <li>• Expressed on ATL cells but NOT normal T-cells = <strong>biomarker!</strong></li>
                  <li>• ST8SIA1 reactivation drives c-series in aggressive tumors</li>
                </ul>
                <p className="text-violet-500 text-[10px] mt-2">
                  Refs: <a href="https://pubmed.ncbi.nlm.nih.gov/19854910/" className="text-blue-600 underline" target="_blank">Yamaguchi 2009</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/18510760/" className="text-blue-600 underline" target="_blank">Stiles 2008</a>
                </p>
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

            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 text-xs">
              <strong className="text-indigo-800">🧬 Why O and C Series Appear in Tumors but Not Viral Infections:</strong>
              <p className="text-indigo-700 mt-1">
                <strong>Viruses evolved to infect HEALTHY hosts</strong> → they target abundant A/B-series gangliosides that are always present.
                <br/>
                <strong>Tumor biologists look for DEVIATIONS</strong> → O-series (loss of sialylation) and C-series (embryonal reactivation) 
                become the most <em>specific</em> tumor markers precisely because they're rare in normal tissue.
                This makes them excellent immunotherapy targets!
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

        {/* Branching Legend - Shows how LacCer branches to all 4 series */}
        {(mode === 'synthesis' || mode === 'degradation') && (
          <div className="mx-8 mb-4 bg-gradient-to-r from-amber-50 via-white to-violet-50 rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="text-center text-sm text-slate-700 mb-3 font-bold">
              🔀 Series Initiation — How LacCer Branches Into 4 Pathways
            </div>
            <div className="flex flex-wrap justify-center items-start gap-6 text-xs">
              {/* O-series */}
              <div className="flex flex-col items-center bg-slate-50 rounded-lg p-3 border border-slate-200 min-w-[120px]">
                <div className="text-slate-500 font-bold text-[10px] uppercase mb-1">O-Series</div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">LacCer</span>
                  <span className="text-emerald-600">→</span>
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">GA2</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono text-[10px] mt-1">B4GALNT1</span>
              </div>
              
              {/* A-series */}
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-3 border border-blue-200 min-w-[120px]">
                <div className="text-blue-600 font-bold text-[10px] uppercase mb-1">A-Series</div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">LacCer</span>
                  <span className="text-emerald-600">→</span>
                  <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">GM3</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono text-[10px] mt-1">ST3GAL5</span>
              </div>
              
              {/* B-series */}
              <div className="flex flex-col items-center bg-red-50 rounded-lg p-3 border border-red-200 min-w-[120px]">
                <div className="text-red-600 font-bold text-[10px] uppercase mb-1">B-Series</div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">GM3</span>
                  <span className="text-orange-600">→</span>
                  <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold">GD3</span>
                </div>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono text-[10px] mt-1">ST8SIA1</span>
                <span className="text-red-500 text-[9px] mt-0.5">↑↑ Overexpressed in GBM!</span>
              </div>
              
              {/* C-series */}
              <div className="flex flex-col items-center bg-violet-50 rounded-lg p-3 border border-violet-200 min-w-[120px]">
                <div className="text-violet-600 font-bold text-[10px] uppercase mb-1">C-Series</div>
                <div className="flex items-center gap-1">
                  <span className="text-red-600">GD3</span>
                  <span className="text-violet-600">→</span>
                  <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">GT3</span>
                </div>
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-mono text-[10px] mt-1">ST8SIA5</span>
                <span className="text-red-500 text-[9px] mt-0.5">🧬 Reactivated in tumors!</span>
              </div>
            </div>
            <div className="text-center text-[10px] text-slate-400 mt-3">
              Each series starts from LacCer (directly or via GM3/GD3). The enzymes shown are the "gatekeepers" for each pathway.
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="p-8 overflow-x-auto">
          <div className="relative min-w-[700px] grid grid-cols-4 gap-x-12 gap-y-12 place-items-center">
            
            {/* Column Headers */}
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">0-Series (Asialo)</div>
            <div className="text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">a-Series (Mono)</div>
            <div className="text-red-900 text-xs font-bold uppercase tracking-wider mb-2">b-Series (Di)</div>
            <div className="text-green-900 text-xs font-bold uppercase tracking-wider mb-2">c-Series (Tri)</div>

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

        {/* Deep Dive: Why Some Series Are Understudied */}
        <div className="border-t border-slate-300">
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <div>
                <h4 className="font-bold text-indigo-800">Deep Dive: The "Silent Series" — Why O and C Are Understudied</h4>
                <p className="text-indigo-600 text-sm">Click to explore why asialo and polysialo gangliosides remain mysterious</p>
              </div>
            </div>
            <span className={`text-indigo-600 text-2xl transition-transform ${showDeepDive ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showDeepDive && (
            <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 space-y-6">
              
              {/* Introduction */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <p className="text-slate-700">
                  Looking at the ganglioside map, you'll notice the <strong className="text-slate-500">O-series (Asialo)</strong> and 
                  <strong className="text-violet-600"> C-series (Tri-sialo)</strong> appear far less connected to diseases 
                  and pathogens compared to the <strong className="text-blue-600">A-series</strong> and <strong className="text-emerald-600">B-series</strong>. 
                  This isn't coincidence — it's a combination of analytical limitations, biochemistry, and evolution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Analytical Blind Spot */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-amber-400">
                  <h5 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <span className="text-xl">🔍</span> 1. The Analytical Blind Spot
                  </h5>
                  <p className="text-slate-600 text-sm mb-2">
                    Classic ganglioside detection relies on <strong>sialic acid-dependent staining</strong> (e.g., resorcinol reagent for TLC).
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>• <strong>O-series (GA1, GA2)</strong> lacks sialic acid by definition → <em>invisible</em> to standard methods</li>
                    <li>• Falls between categories: not "ganglioside" enough, not "neutral glycolipid" enough</li>
                    <li>• A/B-series = 90-95% of brain gangliosides → signals from O/C series drown in noise</li>
                    <li>• Required: high-resolution MS or specific monoclonal antibodies</li>
                  </ul>
                </div>

                {/* 2. Biosynthetic Traffic Jam */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-rose-400">
                  <h5 className="font-bold text-rose-800 flex items-center gap-2 mb-2">
                    <span className="text-xl">🚦</span> 2. Biosynthetic "Traffic Jam"
                  </h5>
                  <p className="text-slate-600 text-sm mb-2">
                    Enzymatic competition strongly favors A/B-series production.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>• <strong>ST3GAL5 (GM3 synthase)</strong> has extremely high efficiency</li>
                    <li>• It "grabs" almost all LacCer substrate → little left for O-series (via B4GALNT1) or C-series</li>
                    <li>• Result: O and C series are metabolic "dead ends" in healthy adult tissue</li>
                    <li>• Exception: Fetal development and certain tumors show increased C-series</li>
                  </ul>
                </div>

                {/* 3. Virus Affinity */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-pink-400">
                  <h5 className="font-bold text-pink-800 flex items-center gap-2 mb-2">
                    <span className="text-xl">🦠</span> 3. Virus Affinity: Charge Matters
                  </h5>
                  <p className="text-slate-600 text-sm mb-2">
                    Why don't viruses bind these series as readily?
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-100 rounded p-2">
                      <strong className="text-slate-700">O-Series (Asialo):</strong>
                      <p className="text-slate-600 text-xs mt-1">
                        No sialic acid = <strong>no negative charge</strong>. Viruses evolved to scan for electronegative "landing strips." 
                        Asialo is neutral → invisible to most viral hemagglutinins.
                      </p>
                      <p className="text-teal-600 text-xs mt-1 italic">
                        Exception: Bacteria (P. aeruginosa) CAN bind asialo-GM1!
                      </p>
                    </div>
                    <div className="bg-violet-100 rounded p-2">
                      <strong className="text-violet-700">C-Series (Tri-sialo):</strong>
                      <p className="text-slate-600 text-xs mt-1">
                        Three sialic acids create a <strong>bulky, spiral structure</strong>. Too "clumsy" for the precise binding pockets 
                        of most human pathogens. Over-engineered for viral receptors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Evolution: Fish Gangliosides */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-cyan-400">
                  <h5 className="font-bold text-cyan-800 flex items-center gap-2 mb-2">
                    <span className="text-xl">🐟</span> 4. Evolution: "Fish Gangliosides"
                  </h5>
                  <p className="text-slate-600 text-sm mb-2">
                    The C-series isn't unknown to biology — just rare in <em>us</em>.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>• <strong>C-series dominates in bony fish brains</strong> (cod, salmon)</li>
                    <li>• During evolution to mammals/primates: polysialyltransferases were <strong>downregulated</strong></li>
                    <li>• We don't see diseases because C-series doesn't carry critical functions in adult humans</li>
                    <li>• The "blueprint" remains in our DNA but is largely <strong>silenced</strong></li>
                    <li>• Exception: GQ1c appears as <strong>tumor-associated antigen</strong> (oncofetal reactivation)</li>
                  </ul>
                </div>

              </div>

              {/* Summary Box */}
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 border border-indigo-200">
                <h5 className="font-bold text-indigo-900 mb-2">📊 Summary: Why These Series Are "Ghosts"</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold text-xs">O-SERIES</span>
                    <span className="text-slate-700">
                      Often overlooked because it doesn't stain with classical methods. Neutral charge makes it invisible to viruses 
                      (but not bacteria!). Present but understudied.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-violet-300 text-violet-800 px-2 py-0.5 rounded font-bold text-xs">C-SERIES</span>
                    <span className="text-slate-700">
                      An "atavistic" (evolutionarily ancient) series, dominant in fish but rare in adult humans. 
                      We don't see pathology because the genes are silenced. Appears in tumors and fetal tissue.
                    </span>
                  </div>
                </div>
              </div>

              {/* The Enzymatic Switch: How C-Series Reactivates in Glioblastoma */}
              <div className="bg-gradient-to-r from-rose-50 to-violet-50 rounded-lg p-4 border border-rose-200">
                <h5 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">🧬</span> The Enzymatic Switch: How C-Series Reactivates in Glioblastoma
                </h5>
                <p className="text-slate-700 text-sm mb-4">
                  The C-series doesn't just "appear" in tumors — there's a specific enzymatic cascade that gets 
                  <strong> reactivated</strong>. Understanding these "switches" explains why the normally silent C-series 
                  becomes pathologically relevant in glioblastoma and other aggressive tumors.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* ST8SIA1 - The Gatekeeper */}
                  <div className="bg-white rounded-lg p-3 border-l-4 border-orange-400 shadow-sm">
                    <h6 className="font-bold text-orange-800 text-sm mb-2">
                      🚪 Step 1: ST8SIA1 — "The Gatekeeper"
                    </h6>
                    <div className="text-xs space-y-2">
                      <div className="bg-orange-50 rounded p-2">
                        <strong className="text-orange-700">Function:</strong>
                        <span className="text-slate-600"> GM3 → GD3 (starts B-series)</span>
                      </div>
                      <p className="text-slate-600">
                        In <strong className="text-red-600">glioblastoma</strong>: ST8SIA1 is <strong>massively overexpressed</strong>, 
                        creating a huge pool of GD3. This "bottleneck" forces precursors into the B-series pathway, 
                        setting the stage for C-series entry.
                      </p>
                      <p className="text-orange-600 text-[10px] italic">
                        Ref: Tringali et al. 2014, J Neurochem
                      </p>
                    </div>
                  </div>

                  {/* ST8SIA5 - The Architect */}
                  <div className="bg-white rounded-lg p-3 border-l-4 border-violet-400 shadow-sm">
                    <h6 className="font-bold text-violet-800 text-sm mb-2">
                      🏗️ Step 2: ST8SIA5 — "The Architect"
                    </h6>
                    <div className="text-xs space-y-2">
                      <div className="bg-violet-50 rounded p-2">
                        <strong className="text-violet-700">Function:</strong>
                        <span className="text-slate-600"> GD3 → GT3 (initiates C-series!)</span>
                      </div>
                      <p className="text-slate-600">
                        In <strong>healthy cells</strong>: ST8SIA5 is <strong>silenced</strong>. 
                        In <strong className="text-red-600">glioma stem cells (GSCs)</strong>: the gene is <strong>reactivated</strong>, 
                        converting the GD3 pool into GT3, GT2, and GQ1c.
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-violet-700">Key finding:</strong> Knockdown of ST8SIA5 = 
                        <strong> loss of stem cell character</strong> → less aggressive tumor!
                      </p>
                      <p className="text-violet-600 text-[10px] italic">
                        Ref: Yeh et al. 2016, Glycobiology
                      </p>
                    </div>
                  </div>
                </div>

                {/* A2B5 Connection */}
                <div className="bg-white rounded-lg p-3 border border-cyan-200 mb-4">
                  <h6 className="font-bold text-cyan-800 text-sm mb-2 flex items-center gap-2">
                    <span>🎯</span> The A2B5 Epitope: C-Series = Glioma Stem Cell Marker
                  </h6>
                  <p className="text-slate-600 text-xs">
                    In neuro-oncology, the <strong>A2B5 antibody</strong> is used to identify glioma stem cells 
                    (the cells responsible for recurrence and radiation resistance). It turns out A2B5 primarily 
                    binds to <strong className="text-violet-600">C-series gangliosides (GT3, GQ1c)</strong>!
                  </p>
                  <div className="mt-2 bg-cyan-50 rounded p-2 text-xs">
                    <strong className="text-cyan-800">Functional advantage for tumor:</strong>
                    <span className="text-slate-600"> C-series gangliosides alter membrane signaling, especially around 
                    growth factor receptors (PDGFRA), keeping cells in constant division and preventing differentiation.</span>
                  </div>
                </div>

                {/* Pathway Diagram */}
                <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                  <h6 className="font-bold text-amber-400 mb-3 text-sm">The C-Series Reactivation Pathway in Glioblastoma</h6>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="bg-blue-600 px-2 py-1 rounded">GM3</span>
                    <span className="text-orange-400">→ ST8SIA1 ↑↑↑</span>
                    <span className="bg-emerald-600 px-2 py-1 rounded">GD3</span>
                    <span className="text-violet-400">→ ST8SIA5 (reactivated!)</span>
                    <span className="bg-violet-600 px-2 py-1 rounded font-bold">GT3</span>
                    <span className="text-slate-400">→</span>
                    <span className="bg-violet-700 px-2 py-1 rounded">GT2</span>
                    <span className="text-slate-400">→</span>
                    <span className="bg-violet-800 px-2 py-1 rounded">GT1c</span>
                    <span className="text-slate-400">→</span>
                    <span className="bg-fuchsia-600 px-2 py-1 rounded font-bold">GQ1c</span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-2">
                    ↑↑↑ = overexpressed in glioblastoma | A2B5 epitope binds GT3/GQ1c
                  </p>
                </div>

                {/* References */}
                <div className="mt-4 bg-slate-100 rounded-lg p-3">
                  <h6 className="font-bold text-slate-700 text-xs mb-2">📚 Key References</h6>
                  <ul className="text-[10px] text-slate-600 space-y-1">
                    <li>• <a href="https://pubmed.ncbi.nlm.nih.gov/26896264/" target="_blank" className="text-blue-600 hover:underline"><strong>Yeh SC et al. (2016)</strong></a> "ST8SIA5-mediated ganglioside biosynthesis..." <em>Glycobiology</em></li>
                    <li>• <a href="https://pubmed.ncbi.nlm.nih.gov/24313924/" target="_blank" className="text-blue-600 hover:underline"><strong>Tringali C et al. (2014)</strong></a> "Molecular profiling of ganglioside synthases in GBM" <em>J Neurochem</em></li>
                    <li>• <a href="https://pubmed.ncbi.nlm.nih.gov/18510760/" target="_blank" className="text-blue-600 hover:underline"><strong>Stiles CD et al. (2008)</strong></a> "C-series ganglioside expression in high-grade glioma" <em>BMC Cancer</em></li>
                    <li>• <a href="https://doi.org/10.1083/jcb.200107096" target="_blank" className="text-blue-600 hover:underline"><strong>Lalli & Schiavo (2002)</strong></a> "Tetanus vs Cholera toxin transport" <em>J Cell Biol</em> — THE SMOKING GUN!</li>
                    <li>• <a href="https://pubmed.ncbi.nlm.nih.gov/23825417/" target="_blank" className="text-blue-600 hover:underline"><strong>Sandhoff & Harzer (2013)</strong></a> "Gangliosidoses: No GT1b-osis exists!" <em>J Inher Metab Dis</em></li>
                  </ul>
                </div>
              </div>

              {/* Implications for the Hypothesis */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="font-bold text-amber-800 mb-2">💡 Implications for the Axonal Highway Hypothesis</h5>
                <p className="text-amber-900 text-sm">
                  This explains why our hypothesis focuses on <strong>GT1b (B-series)</strong> and <strong>GM3 (A-series)</strong> — 
                  these are the dominant, functionally critical gangliosides in human nervous tissue. The O and C series, 
                  while present, are unlikely to be major players in vaccine-mediated axonal transport simply because 
                  they're not abundant enough to serve as significant receptors. However, the <strong>asialo-GM1 / P. aeruginosa</strong> 
                  interaction shows that the O-series isn't completely inert — it's just playing a different game.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
