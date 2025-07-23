package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	sqlite3 "modernc.org/sqlite"

	"github.com/ksankeerth/open-image-registry/log"
)

func InitDB() (*sql.DB, error) {

	serverDir, err := os.Getwd()
	if err != nil {
		log.Logger().Err(err).Msg("Unable to detect server director in runtime using os.Getwd()")
		return nil, err
	}

	// TODO: Add hooks to DB calls so we can monitor query performance
	sql.Register("sqlite-hooked", &sqlite3.Driver{})

	db, err := sql.Open("sqlite-hooked", fmt.Sprintf("file:%s?cache=shared&_fk=1", filepath.Join(serverDir, "open_image_registry.db")))
	if err != nil {
		log.Logger().Err(err).Msg("Unable to open SQL connection to Sqlite")
		return nil, err
	}

	scriptsPath := filepath.Join(serverDir, "db-scripts/sqlite.sql")
	contentBytes, err := os.ReadFile(scriptsPath)
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Unable to open DB scripts to create table: %s", scriptsPath)
		return nil, err
	}

	_, err = db.Exec(string(contentBytes))
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occured when executing DB scripts")
		return nil, err
	}

	return db, nil
}