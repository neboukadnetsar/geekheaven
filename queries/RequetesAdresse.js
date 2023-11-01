const pool = require('./DBPool')

const getVillesParProvince = async (province) => {
    const resultat = await pool.query(
        `SELECT * FROM villes 
            WHERE province_code = $1
            ORDER BY nom ASC;`,
            [province]
    );
    const rows = resultat.rows;

    if (rows.length === 0) return undefined;

    return rows.map(row => {
        const ville = {
            nom: row.nom,
            provinceCode: row.province_code
        };
        console.log(ville);
        return ville;
    });
}
exports.getVillesParProvince = getVillesParProvince;


const getProvinces = async () => {
    const resultat = await pool.query(
        'SELECT * FROM provinces ORDER BY nom ASC;'
    );

    return resultat.rows;
}
exports.getProvinces = getProvinces;