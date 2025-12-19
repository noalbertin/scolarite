const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_changez_moi"

// Middleware
app.use(cors())
app.use(express.json())

// Configuration base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "scolarite",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de connexions
const pool = mysql.createPool(dbConfig)

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token manquant" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" })
    }
    req.user = user
    next()
  })
}

// ============ ROUTES AUTH ============

// Inscription étudiant
app.post("/api/auth/register", async (req, res) => {
  try {
    const { matricule, nom, prenom, date_naissance, lieu_naissance, email, telephone, password, nom_pere, nom_mere } =
      req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.execute(
      `INSERT INTO etudiant 
      (matricule, nom, prenom, date_naissance, lieu_naissance, email, telephone, password_hash, nom_pere, nom_mere)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matricule, nom, prenom, date_naissance, lieu_naissance, email, telephone, hashedPassword, nom_pere, nom_mere],
    )

    res.status(201).json({ message: "Compte créé avec succès", id: result.insertId })
  } catch (error) {
    console.error("Erreur inscription:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Matricule ou email déjà utilisé" })
    } else {
      res.status(500).json({ error: "Erreur lors de l'inscription" })
    }
  }
})

// Connexion
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body

    let query, table
    if (userType === "etudiant") {
      table = "etudiant"
      query = "SELECT * FROM etudiant WHERE email = ? AND actif = TRUE"
    } else {
      table = "personnel_scolarite"
      query = "SELECT * FROM personnel_scolarite WHERE email = ? AND actif = TRUE"
    }

    const [rows] = await pool.execute(query, [email])

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" })
    }

    const user = rows[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" })
    }

    const token = jwt.sign({ id: user.id, email: user.email, type: userType, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    })

    delete user.password_hash
    res.json({ token, user })
  } catch (error) {
    console.error("Erreur connexion:", error)
    res.status(500).json({ error: "Erreur lors de la connexion" })
  }
})

// Mettre à jour le mot de passe
app.put("/api/auth/update-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id
    const userType = req.user.type

    let table
    if (userType === "etudiant") {
      table = "etudiant"
    } else {
      table = "personnel_scolarite"
    }

    // Récupérer le mot de passe actuel hashé
    const [rows] = await pool.execute(`SELECT password_hash FROM ${table} WHERE id = ?`, [userId])

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" })
    }

    const user = rows[0]
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.execute(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [hashedPassword, userId])

    res.json({ message: "Mot de passe mis à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour mot de passe:", error)
    res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe" })
  }
})

// ============ ROUTES TYPES DOCUMENTS ============

app.get("/api/types-documents", authenticateToken, async (req, res) => {
  try {
    const [types] = await pool.execute("SELECT * FROM type_document WHERE actif = TRUE ORDER BY libelle")
    res.json({ types })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// ============ ROUTES DEMANDES ÉTUDIANT ============

// Créer une demande
app.post("/api/demandes", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const { documents } = req.body

    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: "Aucun document sélectionné" })
    }

    await connection.beginTransaction()

    // Calculer le montant total
    const typeIds = documents.map((d) => d.type_document_id)
    const [types] = await connection.execute(`SELECT id, prix FROM type_document WHERE id IN (${typeIds.join(",")})`)

    const montantTotal = types.reduce((sum, type) => sum + type.prix, 0)

    // Créer la demande
    const [result] = await connection.execute(
      "INSERT INTO demande_document (etudiant_id, montant_total) VALUES (?, ?)",
      [req.user.id, montantTotal],
    )

    const demandeId = result.insertId

    // Ajouter les détails
    for (const doc of documents) {
      const typeDoc = types.find((t) => t.id === doc.type_document_id)
      await connection.execute(
        `INSERT INTO demande_document_detail 
        (demande_id, type_document_id, niveau, annee_universitaire, prix)
        VALUES (?, ?, ?, ?, ?)`,
        [demandeId, doc.type_document_id, doc.niveau || null, doc.annee_universitaire || null, typeDoc.prix],
      )
    }

    await connection.commit()
    res.status(201).json({ message: "Demande créée", id: demandeId })
  } catch (error) {
    await connection.rollback()
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur lors de la création" })
  } finally {
    connection.release()
  }
})

// Lister mes demandes
app.get("/api/demandes", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [demandes] = await pool.execute(
      `SELECT d.*, COUNT(dd.id) as nb_documents
       FROM demande_document d
       LEFT JOIN demande_document_detail dd ON d.id = dd.demande_id
       WHERE d.etudiant_id = ?
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [req.user.id],
    )

    res.json({ demandes })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Détail d'une demande (étudiant)
app.get("/api/demandes/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    // Récupérer la demande avec les informations de l'étudiant
    const [demandes] = await pool.execute(
      `SELECT d.*, e.matricule, e.nom, e.prenom, e.email, e.telephone,
              e.nom_pere, e.nom_mere, e.date_naissance, e.lieu_naissance
       FROM demande_document d
       JOIN etudiant e ON d.etudiant_id = e.id
       WHERE d.id = ? AND d.etudiant_id = ?`,
      [req.params.id, req.user.id],
    )

    if (demandes.length === 0) {
      return res.status(404).json({ error: "Demande introuvable" })
    }

    const demande = demandes[0]

    // Structurer les informations de l'étudiant
    demande.etudiant = {
      matricule: demande.matricule,
      nom: demande.nom,
      prenom: demande.prenom,
      email: demande.email,
      telephone: demande.telephone,
      filiere: demande.filiere,
      nom_pere: demande.nom_pere,
      nom_mere: demande.nom_mere,
      date_naissance: demande.date_naissance,
      lieu_naissance: demande.lieu_naissance,
    }

    // Récupérer les documents de la demande
    const [documents] = await pool.execute(
      `SELECT dd.*, td.libelle as type_document_libelle, td.code
       FROM demande_document_detail dd
       JOIN type_document td ON dd.type_document_id = td.id
       WHERE dd.demande_id = ?`,
      [req.params.id],
    )

    demande.documents = documents.map((doc) => ({
      ...doc,
      type_document: {
        libelle: doc.type_document_libelle,
        code: doc.code,
      },
    }))

    res.json({ demande })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// ============ ROUTES NOTIFICATIONS ============

// Lister mes notifications
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [notifications] = await pool.execute(
      `SELECT * FROM notification 
       WHERE etudiant_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id],
    )

    res.json({ notifications })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Marquer une notification comme lue
app.put("/api/notifications/:id/lu", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    // Vérifier que la notification appartient à l'étudiant
    const [result] = await pool.execute(
      `UPDATE notification SET lu = TRUE WHERE id = ? AND etudiant_id = ?`,
      [req.params.id, req.user.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification introuvable ou déjà lue" })
    }

    res.json({ message: "Notification marquée comme lue" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// ============ ROUTES NOTIFICATIONS PERSONNEL ============

// Lister les notifications du personnel
app.get("/api/personnel/notifications", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [notifications] = await pool.execute(
      `SELECT n.*, d.montant_total, d.statut as demande_statut,
              e.nom, e.prenom, e.matricule
       FROM notification_personnel n
       JOIN demande_document d ON n.demande_id = d.id
       JOIN etudiant e ON d.etudiant_id = e.id
       WHERE n.personnel_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    )

    res.json({ notifications })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Compter les notifications non lues
app.get("/api/personnel/notifications/count", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [result] = await pool.execute(
      `SELECT COUNT(*) as count
       FROM notification_personnel
       WHERE personnel_id = ? AND lu = FALSE`,
      [req.user.id]
    )

    res.json({ count: result[0].count })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Marquer une notification comme lue
app.put("/api/personnel/notifications/:id/lu", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [result] = await pool.execute(
      `UPDATE notification_personnel 
       SET lu = TRUE 
       WHERE id = ? AND personnel_id = ?`,
      [req.params.id, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification introuvable" })
    }

    res.json({ message: "Notification marquée comme lue" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// ============ ROUTES PERSONNEL ============

// Lister les demandes (filtrées par statut)
app.get("/api/personnel/demandes", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const { statut } = req.query
    let query = `
      SELECT d.*, e.matricule, e.nom, e.prenom, e.email,
             COUNT(dd.id) as nb_documents
      FROM demande_document d
      JOIN etudiant e ON d.etudiant_id = e.id
      LEFT JOIN demande_document_detail dd ON d.id = dd.demande_id
    `

    const params = []
    if (statut && statut !== "ALL") {
      query += " WHERE d.statut = ?"
      params.push(statut)
    }

    query += " GROUP BY d.id ORDER BY d.created_at DESC"

    const [demandes] = await pool.execute(query, params)
    res.json({ demandes })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Statistiques du personnel
app.get("/api/personnel/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    // Total des demandes
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM demande_document"
    )

    // Demandes en attente
    const [pendingResult] = await pool.execute(
      "SELECT COUNT(*) as pending FROM demande_document WHERE statut = 'EN_ATTENTE'"
    )

    // Demandes validées
    const [validatedResult] = await pool.execute(
      "SELECT COUNT(*) as validated FROM demande_document WHERE statut = 'VALIDEE'"
    )

    // Demandes prêtes
    const [readyResult] = await pool.execute(
      "SELECT COUNT(*) as ready FROM demande_document WHERE statut = 'PRET'"
    )

    // Demandes retirées
    const [withdrawnResult] = await pool.execute(
      "SELECT COUNT(*) as withdrawn FROM demande_document WHERE statut = 'RETIRE'"
    )

    const stats = {
      total: totalResult[0].total,
      pending: pendingResult[0].pending,
      validated: validatedResult[0].validated,
      ready: readyResult[0].ready,
      withdrawn: withdrawnResult[0].withdrawn,
    }

    res.json(stats)
  } catch (error) {
    console.error("Erreur récupération stats:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Récupérer le profil de l'étudiant connecté
app.get("/api/etudiant/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [rows] = await pool.execute(
      `SELECT id, matricule, nom, prenom, date_naissance, lieu_naissance, 
              email, telephone, nom_pere, nom_mere, actif, created_at
       FROM etudiant 
       WHERE id = ?`,
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profil introuvable" })
    }

    res.json({ user: rows[0] })
  } catch (error) {
    console.error("Erreur récupération profil:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Mettre à jour le profil de l'étudiant connecté
app.put("/api/etudiant/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "etudiant") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const { nom, prenom, date_naissance, lieu_naissance, email, telephone, nom_pere, nom_mere } = req.body

    // Validation basique
    if (!email || !nom || !prenom) {
      return res.status(400).json({ error: "Les champs obligatoires (Nom, Prénom, Email) sont requis" })
    }

    // Vérifier si l'email existe déjà pour un autre étudiant
    const [existingEmail] = await pool.execute(
      "SELECT id FROM etudiant WHERE email = ? AND id != ?",
      [email, req.user.id]
    )

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" })
    }

    // Mettre à jour le profil
    await pool.execute(
      `UPDATE etudiant 
       SET nom = ?, prenom = ?, date_naissance = ?, lieu_naissance = ?, email = ?, telephone = ?, nom_pere = ?, nom_mere = ?, updated_at = NOW()
       WHERE id = ?`,
      [nom, prenom, date_naissance, lieu_naissance, email, telephone || null, nom_pere || null, nom_mere || null, req.user.id]
    )

    // Récupérer le profil mis à jour
    const [rows] = await pool.execute(
      `SELECT id, matricule, nom, prenom, date_naissance, lieu_naissance, 
              email, telephone, nom_pere, nom_mere, actif, created_at
       FROM etudiant 
       WHERE id = ?`,
      [req.user.id]
    )

    res.json({
      message: "Profil mis à jour avec succès",
      user: rows[0]
    })
  } catch (error) {
    console.error("Erreur mise à jour profil:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Détail d'une demande
app.get("/api/personnel/demandes/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const [demandes] = await pool.execute(
      `SELECT d.*, e.matricule, e.nom, e.prenom, e.email, e.telephone,
              e.nom_pere, e.nom_mere, e.date_naissance, e.lieu_naissance
       FROM demande_document d
       JOIN etudiant e ON d.etudiant_id = e.id
       WHERE d.id = ?`,
      [req.params.id],
    )

    if (demandes.length === 0) {
      return res.status(404).json({ error: "Demande introuvable" })
    }

    const demande = demandes[0]
    demande.etudiant = {
      matricule: demande.matricule,
      nom: demande.nom,
      prenom: demande.prenom,
      email: demande.email,
      telephone: demande.telephone,
      nom_pere: demande.nom_pere,
      nom_mere: demande.nom_mere,
      date_naissance: demande.date_naissance,
      lieu_naissance: demande.lieu_naissance,
    }

    const [documents] = await pool.execute(
      `SELECT dd.*, td.libelle as type_document_libelle, td.code
       FROM demande_document_detail dd
       JOIN type_document td ON dd.type_document_id = td.id
       WHERE dd.demande_id = ?`,
      [req.params.id],
    )

    demande.documents = documents.map((doc) => ({
      ...doc,
      type_document: {
        libelle: doc.type_document_libelle,
        code: doc.code,
      },
    }))

    res.json({ demande })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Valider une demande
app.post("/api/personnel/demandes/:id/valider", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    await pool.execute(
      `UPDATE demande_document 
       SET statut = 'VALIDEE', validee_par = ?, validee_le = NOW()
       WHERE id = ?`,
      [req.user.id, req.params.id],
    )

    res.json({ message: "Demande validée" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Rejeter une demande
app.post("/api/personnel/demandes/:id/rejeter", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    const { commentaire } = req.body

    await pool.execute(
      `UPDATE demande_document 
       SET statut = 'REJETEE', validee_par = ?, validee_le = NOW(), commentaire_rejet = ?
       WHERE id = ?`,
      [req.user.id, commentaire, req.params.id],
    )

    res.json({ message: "Demande rejetée" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Préparer le document (marquer comme prêt)
app.post("/api/personnel/demandes/:id/preparer", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    await pool.execute(
      `UPDATE demande_document 
       SET statut = 'PRET', preparee_par = ?, preparee_le = NOW()
       WHERE id = ?`,
      [req.user.id, req.params.id],
    )

    res.json({ message: "Document marqué comme prêt" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

// Marquer comme retiré
app.post("/api/personnel/demandes/:id/retirer", authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== "personnel") {
      return res.status(403).json({ error: "Accès non autorisé" })
    }

    await pool.execute(
      `UPDATE demande_document 
       SET statut = 'RETIRE', retiree_le = NOW()
       WHERE id = ?`,
      [req.params.id],
    )

    res.json({ message: "Document marqué comme retiré" })
  } catch (error) {
    console.error("Erreur:", error)
    res.status(500).json({ error: "Erreur serveur" })
  }
})



// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`)
  console.log(`📊 Base de données: ${dbConfig.database}@${dbConfig.host}`)
})
