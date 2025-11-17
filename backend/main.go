package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

type TimeSlot struct {
	ID          int    `json:"id"`
	Label       string `json:"label"`
	AssignedTo  string `json:"assigned_to"`
	Position    int    `json:"position"`
}

type Class struct {
	ID        int        `json:"id"`
	Name      string     `json:"name"`
	TimeSlots []TimeSlot `json:"time_slots"`
}

type CreateClassRequest struct {
	Name      string   `json:"name"`
	TimeSlots []string `json:"time_slots"`
}

type AssignSlotRequest struct {
	AssignedTo string `json:"assigned_to"`
}

var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./classes.db")
	if err != nil {
		log.Fatal(err)
	}

	// テーブル作成
	createClassTable := `
	CREATE TABLE IF NOT EXISTS classes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL
	);`

	createTimeSlotTable := `
	CREATE TABLE IF NOT EXISTS time_slots (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		class_id INTEGER NOT NULL,
		label TEXT NOT NULL,
		assigned_to TEXT DEFAULT '',
		position INTEGER NOT NULL,
		FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
	);`

	if _, err := db.Exec(createClassTable); err != nil {
		log.Fatal(err)
	}
	if _, err := db.Exec(createTimeSlotTable); err != nil {
		log.Fatal(err)
	}
}

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	// CORS設定
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// ルート
	r.GET("/api/classes", getClasses)
	r.GET("/api/classes/:id", getClass)
	r.POST("/api/classes", createClass)
	r.DELETE("/api/classes/:id", deleteClass)
	r.PUT("/api/classes/:classId/slots/:slotId", assignSlot)

	log.Println("Server starting on :8080")
	r.Run(":8080")
}

// 授業一覧取得
func getClasses(c *gin.Context) {
	rows, err := db.Query("SELECT id, name FROM classes ORDER BY id DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var classes []Class
	for rows.Next() {
		var class Class
		if err := rows.Scan(&class.ID, &class.Name); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// タイムスロット取得
		slotRows, err := db.Query("SELECT id, label, assigned_to, position FROM time_slots WHERE class_id = ? ORDER BY position", class.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		var timeSlots []TimeSlot
		for slotRows.Next() {
			var slot TimeSlot
			if err := slotRows.Scan(&slot.ID, &slot.Label, &slot.AssignedTo, &slot.Position); err != nil {
				slotRows.Close()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			timeSlots = append(timeSlots, slot)
		}
		slotRows.Close()
		
		class.TimeSlots = timeSlots
		classes = append(classes, class)
	}

	if classes == nil {
		classes = []Class{}
	}

	c.JSON(http.StatusOK, classes)
}

// 授業詳細取得
func getClass(c *gin.Context) {
	id := c.Param("id")
	
	var class Class
	err := db.QueryRow("SELECT id, name FROM classes WHERE id = ?", id).Scan(&class.ID, &class.Name)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// タイムスロット取得
	rows, err := db.Query("SELECT id, label, assigned_to, position FROM time_slots WHERE class_id = ? ORDER BY position", class.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var timeSlots []TimeSlot
	for rows.Next() {
		var slot TimeSlot
		if err := rows.Scan(&slot.ID, &slot.Label, &slot.AssignedTo, &slot.Position); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		timeSlots = append(timeSlots, slot)
	}
	
	class.TimeSlots = timeSlots
	c.JSON(http.StatusOK, class)
}

// 授業作成
func createClass(c *gin.Context) {
	var req CreateClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 授業を作成
	result, err := db.Exec("INSERT INTO classes (name) VALUES (?)", req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	classID, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// タイムスロットを作成
	for i, label := range req.TimeSlots {
		_, err := db.Exec("INSERT INTO time_slots (class_id, label, assigned_to, position) VALUES (?, ?, '', ?)",
			classID, label, i)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"id": classID, "message": "Class created successfully"})
}

// 授業削除
func deleteClass(c *gin.Context) {
	id := c.Param("id")
	
	result, err := db.Exec("DELETE FROM classes WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	// タイムスロットは外部キー制約で自動削除される
	c.JSON(http.StatusOK, gin.H{"message": "Class deleted successfully"})
}

// タイムスロットに担当者を割り当て
func assignSlot(c *gin.Context) {
	slotId := c.Param("slotId")
	
	var req AssignSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.Exec("UPDATE time_slots SET assigned_to = ? WHERE id = ?", req.AssignedTo, slotId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Time slot not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Slot assigned successfully"})
}

