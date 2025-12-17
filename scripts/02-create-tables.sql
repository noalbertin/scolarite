USE scolarite;

-- ======================================================
-- BASE DE DONNÉES : SCOLARITE - DEMANDE DE DOCUMENTS
-- ======================================================

-- =========================
-- TABLE ETUDIANT
-- =========================
CREATE TABLE IF NOT EXISTS etudiant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    nom_pere VARCHAR(100),
    nom_mere VARCHAR(100),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABLE PERSONNEL SCOLARITE
-- =========================
CREATE TABLE IF NOT EXISTS personnel_scolarite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','AGENT') DEFAULT 'AGENT',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABLE TYPE DOCUMENT
-- =========================
CREATE TABLE IF NOT EXISTS type_document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    prix INT NOT NULL,
    description TEXT,
    necessite_niveau BOOLEAN DEFAULT FALSE,
    niveaux_autorises VARCHAR(100) COMMENT 'Ex: L3,M2 pour attestation réussite',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE DEMANDE DOCUMENT
-- =========================
CREATE TABLE IF NOT EXISTS demande_document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    statut ENUM(
        'EN_ATTENTE',
        'VALIDEE',
        'REJETEE',
        'EN_PREPARATION',
        'PRET',
        'RETIRE'
    ) DEFAULT 'EN_ATTENTE',
    montant_total INT DEFAULT 0,
    commentaire_rejet TEXT,
    validee_par INT,
    validee_le TIMESTAMP NULL,
    preparee_par INT,
    preparee_le TIMESTAMP NULL,
    retiree_le TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id),
    FOREIGN KEY (validee_par) REFERENCES personnel_scolarite(id),
    FOREIGN KEY (preparee_par) REFERENCES personnel_scolarite(id)
);

-- =========================
-- DETAILS DES DOCUMENTS DEMANDÉS
-- =========================
CREATE TABLE IF NOT EXISTS demande_document_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demande_id INT NOT NULL,
    type_document_id INT NOT NULL,
    niveau VARCHAR(20),
    annee_universitaire VARCHAR(20),
    statut ENUM(
        'EN_ATTENTE',
        'EN_PREPARATION',
        'PRET'
    ) DEFAULT 'EN_ATTENTE',
    prix INT NOT NULL,
    eligible BOOLEAN DEFAULT TRUE,
    raison_ineligibilite TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demande_document(id) ON DELETE CASCADE,
    FOREIGN KEY (type_document_id) REFERENCES type_document(id)
);

-- =========================
-- PARCOURS ETUDIANT
-- =========================
CREATE TABLE IF NOT EXISTS parcours_etudiant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    niveau VARCHAR(20) NOT NULL,
    annee_universitaire VARCHAR(20) NOT NULL,
    statut ENUM('EN_COURS', 'VALIDE', 'REDOUBLEMENT', 'ABANDON') DEFAULT 'EN_COURS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id)
);

-- =========================
-- HISTORIQUE DES DEMANDES
-- =========================
CREATE TABLE IF NOT EXISTS historique_demande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demande_id INT NOT NULL,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50) NOT NULL,
    modifie_par INT,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES demande_document(id) ON DELETE CASCADE,
    FOREIGN KEY (modifie_par) REFERENCES personnel_scolarite(id)
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    demande_id INT NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id),
    FOREIGN KEY (demande_id) REFERENCES demande_document(id) ON DELETE CASCADE
);

-- =========================
-- INDEX POUR PERFORMANCE
-- =========================
CREATE INDEX idx_demande_etudiant ON demande_document(etudiant_id);
CREATE INDEX idx_detail_demande ON demande_document_detail(demande_id);
CREATE INDEX idx_notification_etudiant ON notification(etudiant_id);
CREATE INDEX idx_demande_statut ON demande_document(statut);
CREATE INDEX idx_notification_non_lue ON notification(etudiant_id, lu);
CREATE INDEX idx_parcours_etudiant ON parcours_etudiant(etudiant_id, annee_universitaire);
CREATE INDEX idx_historique_demande ON historique_demande(demande_id, created_at);
