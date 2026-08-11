"""DB 연결 계층.

지금(스모크 테스트)은 CSV 폴더를 DuckDB 인메모리 DB로 읽어들입니다.
본선 현장에서 실제 OMOP DB(Postgres 등)에 붙일 때는 이 파일의
`load_duckdb()` 대신 `connect_postgres()`를 쓰도록 `run_pipeline.py`의
`--backend` 옵션만 바꾸면 됩니다. SQL 자체(03_cohort_extraction.sql)는
공통으로 재사용합니다.
"""

from pathlib import Path

import duckdb


def load_duckdb(data_dir: str) -> duckdb.DuckDBPyConnection:
    """data_dir 안의 모든 *.csv를 파일명과 같은 이름의 테이블로 로드."""
    con = duckdb.connect(database=":memory:")
    csv_dir = Path(data_dir)
    csv_files = sorted(csv_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"{data_dir}에 CSV 파일이 없습니다.")
    for csv_path in csv_files:
        table_name = csv_path.stem
        con.execute(
            f"CREATE TABLE {table_name} AS SELECT * FROM read_csv_auto(?, "
            f"dateformat='%Y-%m-%d')",
            [str(csv_path)],
        )
    return con


def connect_postgres(dsn: str) -> duckdb.DuckDBPyConnection:
    """본선용: 실제 OMOP Postgres DB에 DuckDB의 postgres 확장으로 접속.

    dsn 예시: "host=localhost dbname=omop user=analyst password=..."
    DuckDB의 postgres_scanner 확장이 필요합니다(안심존 인터넷이 막혀있다면
    사전에 확장 파일을 내려받아 반입해야 합니다 -- INSTALL/LOAD 'postgres'
    는 기본적으로 원격에서 확장을 내려받으므로, 오프라인 설치 방법은
    DuckDB 공식 문서의 "Community Extensions" 오프라인 설치 절차를 따르세요).
    """
    con = duckdb.connect(database=":memory:")
    con.execute("INSTALL postgres;")
    con.execute("LOAD postgres;")
    con.execute(f"ATTACH '{dsn}' AS omop (TYPE postgres);")
    con.execute("USE omop;")
    return con
