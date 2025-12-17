USE scolarite;

-- =========================
-- INSERTION DES TYPES DE DOCUMENTS
-- =========================
INSERT INTO type_document (code, libelle, prix, necessite_niveau, niveaux_autorises) VALUES
('RELEVE', 'Relevé de notes', 2000, TRUE, NULL),
('CERTIFICAT', 'Certificat de scolarité', 2000, FALSE, NULL),
('ATTEST_INSCRIPTION', 'Attestation d''inscription', 3000, FALSE, NULL),
('ATTEST_REUSSITE', 'Attestation de réussite', 3000, TRUE, 'L3,M2'),
('ATTEST_FIN_ETUDE', 'Attestation de fin d''études', 3000, FALSE, NULL),
('ATTEST_FRANCAIS', 'Attestation d''apprentissage de français', 3000, FALSE, NULL),
('ATTEST_FIN_FORMATION', 'Attestation de fin de formation', 3000, FALSE, NULL);

-- =========================
-- INSERTION D'UN PERSONNEL (ADMIN)
-- Mot de passe: admin123
-- =========================
INSERT INTO personnel_scolarite (nom, prenom, email, password_hash, role) VALUES
('Administrateur', 'Scolarité', 'admin@scolarite.mg', '$2b$10$YQvZXQ8YXN5YXN5YXN5YXeuKGqJ5HqJXN5YXN5YXN5YXN5YXN5YXN', 'ADMIN');

-- Note: Le hash ci-dessus est un exemple. Vous devrez le générer avec bcrypt pour 'admin123'
