
-- =========================
-- TABLE NOTIFICATION PERSONNEL
-- =========================
CREATE TABLE IF NOT EXISTS notification_personnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personnel_id INT,
    demande_id INT NOT NULL,
    type ENUM('NOUVELLE_DEMANDE', 'DEMANDE_VALIDEE', 'DEMANDE_REJETEE') DEFAULT 'NOUVELLE_DEMANDE',
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personnel_id) REFERENCES personnel_scolarite(id) ON DELETE CASCADE,
    FOREIGN KEY (demande_id) REFERENCES demande_document(id) ON DELETE CASCADE
);

-- =========================
-- INDEX POUR PERFORMANCE
-- =========================
CREATE INDEX idx_notification_personnel ON notification_personnel(personnel_id, lu);
CREATE INDEX idx_notification_personnel_created ON notification_personnel(created_at DESC);

-- =========================
-- TRIGGER POUR NOUVELLE DEMANDE
-- =========================
-- Note: Le trigger se déclenche sur l'insertion des détails de documents
-- car c'est à ce moment que nous connaissons le nombre exact de documents
DELIMITER //

DROP TRIGGER IF EXISTS trg_notification_nouvelle_demande//

CREATE TRIGGER trg_notification_nouvelle_demande
AFTER INSERT ON demande_document_detail
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_personnel_id INT;
    DECLARE v_etudiant_nom VARCHAR(100);
    DECLARE v_etudiant_prenom VARCHAR(100);
    DECLARE v_nb_documents INT;
    DECLARE v_notification_exists INT;
    
    -- Curseur pour parcourir tous les personnels actifs
    DECLARE cur_personnel CURSOR FOR 
        SELECT id FROM personnel_scolarite WHERE actif = TRUE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Récupérer les informations de l'étudiant
    SELECT e.nom, e.prenom INTO v_etudiant_nom, v_etudiant_prenom
    FROM demande_document d
    JOIN etudiant e ON d.etudiant_id = e.id
    WHERE d.id = NEW.demande_id;
    
    -- Compter le nombre de documents dans la demande
    SELECT COUNT(*) INTO v_nb_documents
    FROM demande_document_detail
    WHERE demande_id = NEW.demande_id;
    
    -- Vérifier si une notification existe déjà pour cette demande
    SELECT COUNT(*) INTO v_notification_exists
    FROM notification_personnel
    WHERE demande_id = NEW.demande_id;
    
    IF v_notification_exists = 0 THEN
        -- Créer une notification pour chaque personnel actif
        OPEN cur_personnel;
        
        read_loop: LOOP
            FETCH cur_personnel INTO v_personnel_id;
            IF done THEN
                LEAVE read_loop;
            END IF;
            
            INSERT INTO notification_personnel (personnel_id, demande_id, type, message)
            VALUES (
                v_personnel_id,
                NEW.demande_id,
                'NOUVELLE_DEMANDE',
                CONCAT('Nouvelle demande #', NEW.demande_id, ' de ', v_etudiant_nom, ' ', v_etudiant_prenom, ' (', v_nb_documents, ' document(s))')
            );
        END LOOP;
        
        CLOSE cur_personnel;
    ELSE
        -- Mettre à jour le message avec le nombre de documents actuel
        UPDATE notification_personnel
        SET message = CONCAT('Nouvelle demande #', NEW.demande_id, ' de ', v_etudiant_prenom, ' ', v_etudiant_nom, ' (', v_nb_documents, ' document(s))')
        WHERE demande_id = NEW.demande_id;
    END IF;
END//

DELIMITER ;