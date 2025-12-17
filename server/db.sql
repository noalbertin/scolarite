-- ======================================================
-- BASE DE DONNÉES : SCOLARITE - DEMANDE DE DOCUMENTS
-- VERSION AMÉLIORÉE
-- ======================================================

-- =========================
-- TABLE ETUDIANT
-- =========================
CREATE TABLE etudiant (
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
CREATE TABLE personnel_scolarite (
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
CREATE TABLE type_document (
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

INSERT INTO type_document (code, libelle, prix, necessite_niveau, niveaux_autorises) VALUES
('RELEVE', 'Relevé de notes', 2000, TRUE, NULL),
('CERTIFICAT', 'Certificat de scolarité', 2000, FALSE, NULL),
('ATTEST_INSCRIPTION', 'Attestation d''inscription', 3000, FALSE, NULL),
('ATTEST_REUSSITE', 'Attestation de réussite', 3000, TRUE, 'L3,M2'),
('ATTEST_FIN_ETUDE', 'Attestation de fin d''études', 3000, FALSE, NULL),
('ATTEST_FRANCAIS', 'Attestation d''apprentissage de français', 3000, FALSE, NULL),
('ATTEST_FIN_FORMATION', 'Attestation de fin de formation', 3000, FALSE, NULL);

-- =========================
-- TABLE DEMANDE DOCUMENT
-- =========================
CREATE TABLE demande_document (
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
CREATE TABLE demande_document_detail (
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
CREATE TABLE parcours_etudiant (
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
CREATE TABLE historique_demande (
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
CREATE TABLE notification (
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
-- Index existants
CREATE INDEX idx_demande_etudiant ON demande_document(etudiant_id);
CREATE INDEX idx_detail_demande ON demande_document_detail(demande_id);
CREATE INDEX idx_notification_etudiant ON notification(etudiant_id);

-- Nouveaux index
CREATE INDEX idx_demande_statut ON demande_document(statut);
CREATE INDEX idx_notification_non_lue ON notification(etudiant_id, lu);
CREATE INDEX idx_parcours_etudiant ON parcours_etudiant(etudiant_id, annee_universitaire);
CREATE INDEX idx_historique_demande ON historique_demande(demande_id, created_at);
CREATE INDEX idx_etudiant_actif ON etudiant(actif);
CREATE INDEX idx_personnel_actif ON personnel_scolarite(actif);

-- =========================
-- TRIGGERS
-- =========================

-- Trigger pour historiser les changements de statut des demandes
DELIMITER //
CREATE TRIGGER trg_historique_demande_update
AFTER UPDATE ON demande_document
FOR EACH ROW
BEGIN
    IF OLD.statut != NEW.statut THEN
        INSERT INTO historique_demande (demande_id, ancien_statut, nouveau_statut, modifie_par)
        VALUES (NEW.id, OLD.statut, NEW.statut, NEW.validee_par);
    END IF;
END//

-- Trigger pour créer notification quand document est prêt
CREATE TRIGGER trg_notification_document_pret
AFTER UPDATE ON demande_document
FOR EACH ROW
BEGIN
    IF NEW.statut = 'PRET' AND OLD.statut != 'PRET' THEN
        INSERT INTO notification (etudiant_id, demande_id, message)
        VALUES (
            NEW.etudiant_id, 
            NEW.id, 
            CONCAT('Votre demande #', NEW.id, ' est prête pour retrait. Montant à payer : ', NEW.montant_total, ' Ar')
        );
    END IF;
END//

-- Trigger pour créer notification en cas de rejet
CREATE TRIGGER trg_notification_demande_rejetee
AFTER UPDATE ON demande_document
FOR EACH ROW
BEGIN
    IF NEW.statut = 'REJETEE' AND OLD.statut != 'REJETEE' THEN
        INSERT INTO notification (etudiant_id, demande_id, message)
        VALUES (
            NEW.etudiant_id, 
            NEW.id, 
            CONCAT('Votre demande #', NEW.id, ' a été rejetée. Raison : ', COALESCE(NEW.commentaire_rejet, 'Non spécifiée'))
        );
    END IF;
END//

DELIMITER ;

-- =========================
-- VUES UTILES
-- =========================

-- Vue pour les demandes en attente
CREATE VIEW v_demandes_en_attente AS
SELECT 
    d.id,
    d.created_at,
    e.matricule,
    e.nom,
    e.prenom,
    e.email,
    d.montant_total,
    COUNT(dd.id) as nb_documents
FROM demande_document d
JOIN etudiant e ON d.etudiant_id = e.id
LEFT JOIN demande_document_detail dd ON d.id = dd.demande_id
WHERE d.statut = 'EN_ATTENTE'
GROUP BY d.id, d.created_at, e.matricule, e.nom, e.prenom, e.email, d.montant_total;

-- Vue pour l'historique complet d'une demande
CREATE VIEW v_historique_complet_demande AS
SELECT 
    d.id as demande_id,
    e.matricule,
    CONCAT(e.nom, ' ', e.prenom) as etudiant,
    d.statut as statut_actuel,
    d.montant_total,
    h.ancien_statut,
    h.nouveau_statut,
    h.created_at as date_changement,
    CONCAT(p.nom, ' ', p.prenom) as modifie_par,
    h.commentaire
FROM demande_document d
JOIN etudiant e ON d.etudiant_id = e.id
LEFT JOIN historique_demande h ON d.id = h.demande_id
LEFT JOIN personnel_scolarite p ON h.modifie_par = p.id
ORDER BY d.id, h.created_at;

-- Vue pour les notifications non lues par étudiant
CREATE VIEW v_notifications_non_lues AS
SELECT 
    e.id as etudiant_id,
    e.matricule,
    e.email,
    COUNT(n.id) as nb_notifications_non_lues
FROM etudiant e
LEFT JOIN notification n ON e.id = n.etudiant_id AND n.lu = FALSE
GROUP BY e.id, e.matricule, e.email;

-- Vue détaillée des demandes
CREATE VIEW v_demandes_details AS
SELECT 
    d.id as demande_id,
    d.created_at as date_demande,
    d.statut as statut_demande,
    d.montant_total,
    e.matricule,
    CONCAT(e.nom, ' ', e.prenom) as etudiant,
    e.email,
    e.telephone,
    td.libelle as type_document,
    dd.niveau,
    dd.annee_universitaire,
    dd.statut as statut_document,
    dd.prix,
    CONCAT(pv.nom, ' ', pv.prenom) as validee_par,
    d.validee_le,
    CONCAT(pp.nom, ' ', pp.prenom) as preparee_par,
    d.preparee_le
FROM demande_document d
JOIN etudiant e ON d.etudiant_id = e.id
LEFT JOIN demande_document_detail dd ON d.id = dd.demande_id
LEFT JOIN type_document td ON dd.type_document_id = td.id
LEFT JOIN personnel_scolarite pv ON d.validee_par = pv.id
LEFT JOIN personnel_scolarite pp ON d.preparee_par = pp.id;

-- =========================
-- PROCÉDURES STOCKÉES
-- =========================

-- Procédure pour valider une demande
DELIMITER //
CREATE PROCEDURE sp_valider_demande(
    IN p_demande_id INT,
    IN p_personnel_id INT
)
BEGIN
    DECLARE v_statut VARCHAR(50);
    
    -- Vérifier le statut actuel
    SELECT statut INTO v_statut FROM demande_document WHERE id = p_demande_id;
    
    IF v_statut = 'EN_ATTENTE' THEN
        UPDATE demande_document 
        SET statut = 'VALIDEE',
            validee_par = p_personnel_id,
            validee_le = CURRENT_TIMESTAMP
        WHERE id = p_demande_id;
        
        SELECT 'Demande validée avec succès' as message;
    ELSE
        SELECT 'Erreur: La demande n''est pas en attente de validation' as message;
    END IF;
END//

-- Procédure pour rejeter une demande
CREATE PROCEDURE sp_rejeter_demande(
    IN p_demande_id INT,
    IN p_personnel_id INT,
    IN p_commentaire TEXT
)
BEGIN
    UPDATE demande_document 
    SET statut = 'REJETEE',
        validee_par = p_personnel_id,
        validee_le = CURRENT_TIMESTAMP,
        commentaire_rejet = p_commentaire
    WHERE id = p_demande_id;
    
    SELECT 'Demande rejetée avec succès' as message;
END//

-- Procédure pour marquer un document comme prêt
CREATE PROCEDURE sp_marquer_document_pret(
    IN p_demande_id INT,
    IN p_personnel_id INT
)
BEGIN
    UPDATE demande_document 
    SET statut = 'PRET',
        preparee_par = p_personnel_id,
        preparee_le = CURRENT_TIMESTAMP
    WHERE id = p_demande_id;
    
    SELECT 'Document marqué comme prêt' as message;
END//

-- Procédure pour enregistrer le retrait
CREATE PROCEDURE sp_enregistrer_retrait(
    IN p_demande_id INT
)
BEGIN
    UPDATE demande_document 
    SET statut = 'RETIRE',
        retiree_le = CURRENT_TIMESTAMP
    WHERE id = p_demande_id;
    
    SELECT 'Retrait enregistré avec succès' as message;
END//

-- Fonction pour vérifier l'éligibilité d'un étudiant pour un type de document
CREATE FUNCTION fn_verifier_eligibilite(
    p_etudiant_id INT,
    p_type_document_code VARCHAR(50),
    p_niveau VARCHAR(20)
) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_eligible BOOLEAN DEFAULT TRUE;
    DECLARE v_niveaux_autorises VARCHAR(100);
    
    -- Récupérer les niveaux autorisés
    SELECT niveaux_autorises INTO v_niveaux_autorises
    FROM type_document
    WHERE code = p_type_document_code;
    
    -- Si des niveaux sont spécifiés, vérifier
    IF v_niveaux_autorises IS NOT NULL THEN
        IF FIND_IN_SET(p_niveau, v_niveaux_autorises) = 0 THEN
            SET v_eligible = FALSE;
        END IF;
    END IF;
    
    RETURN v_eligible;
END//

DELIMITER ;

-- =========================
-- DONNÉES DE TEST
-- =========================

-- Insertion d'un personnel de scolarité (password: admin123)
INSERT INTO personnel_scolarite (nom, prenom, email, password_hash, role) 
VALUES ('Admin', 'Scolarité', 'admin@scolarite.mg', '$2y$10$example_hash', 'ADMIN');

-- Insertion d'un étudiant de test (password: etudiant123)
INSERT INTO etudiant (matricule, nom, prenom, date_naissance, lieu_naissance, email, telephone, password_hash, nom_pere, nom_mere)
VALUES ('2024-001', 'Rakoto', 'Jean', '2000-05-15', 'Antananarivo', 'jean.rakoto@example.mg', '0341234567', '$2y$10$example_hash', 'Rakoto Père', 'Rakoto Mère');

-- Insertion du parcours de l'étudiant
INSERT INTO parcours_etudiant (etudiant_id, niveau, annee_universitaire, statut)
VALUES 
(1, 'L1', '2021-2022', 'VALIDE'),
(1, 'L2', '2022-2023', 'VALIDE'),
(1, 'L3', '2023-2024', 'EN_COURS');

-- ======================================================
-- FIN DU SCRIPT
-- ======================================================