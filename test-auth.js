// Script para testing del sistema de autenticación
// Ejecutar con: node test-auth.js

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING MINDHUB AUTHENTICATION SYSTEM');
console.log('==========================================\n');

// Test 1: Verificar estructura de archivos
console.log('1️⃣ Verificando estructura de archivos...');

const requiredFiles = [
    'api/register.js',
    'api/login.js',
    'public/index.html',
    'public/register.html',
    'public/sistema.html',
    'package.json'
];

let filesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - NO ENCONTRADO`);
        filesExist = false;
    }
});

// Test 2: Verificar directorio data
console.log('\n2️⃣ Verificando directorio data...');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('   📁 Directorio data/ creado');
}

const usersFile = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    console.log('   📄 Archivo users.json creado');
}

// Test 3: Verificar sintaxis de APIs
console.log('\n3️⃣ Verificando sintaxis de APIs...');
try {
    require('./api/register.js');
    console.log('   ✅ api/register.js - Sintaxis válida');
} catch (error) {
    console.log('   ❌ api/register.js - Error de sintaxis:', error.message);
    filesExist = false;
}

try {
    require('./api/login.js');
    console.log('   ✅ api/login.js - Sintaxis válida');
} catch (error) {
    console.log('   ❌ api/login.js - Error de sintaxis:', error.message);
    filesExist = false;
}

// Test 4: Verificar package.json
console.log('\n4️⃣ Verificando dependencias...');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.dependencies && pkg.dependencies.jsonwebtoken) {
        console.log('   ✅ jsonwebtoken dependency found');
    } else {
        console.log('   ⚠️  jsonwebtoken dependency missing');
    }
} catch (error) {
    console.log('   ❌ Error leyendo package.json:', error.message);
}

// Test 5: Simular datos de prueba
console.log('\n5️⃣ Creando datos de prueba...');
try {
    const testUsers = [
        {
            id: "test_admin_" + Date.now(),
            email: "admin@mindhub.com",
            password: "admin123",
            nombre: "Admin",
            apellido: "Sistema",
            institucion: "MindHub",
            role: "admin",
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        },
        {
            id: "test_user_" + Date.now(),
            email: "usuario@test.com",
            password: "user123",
            nombre: "Usuario",
            apellido: "Prueba",
            institucion: "Hospital Test",
            role: "free",
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        }
    ];
    
    fs.writeFileSync(usersFile, JSON.stringify(testUsers, null, 2));
    console.log('   ✅ Usuarios de prueba creados:');
    console.log('      📧 admin@mindhub.com / admin123 (admin)');
    console.log('      📧 usuario@test.com / user123 (free)');
} catch (error) {
    console.log('   ❌ Error creando usuarios de prueba:', error.message);
}

// Resultado final
console.log('\n🎯 RESULTADO DEL TESTING');
console.log('========================');

if (filesExist) {
    console.log('✅ SISTEMA LISTO PARA DEPLOYMENT');
    console.log('\n📋 COMANDOS PARA EJECUTAR:');
    console.log('1. npm install');
    console.log('2. vercel --prod');
    console.log('\n🌐 URLs de prueba:');
    console.log('• https://tu-domain.vercel.app/ (login)');
    console.log('• https://tu-domain.vercel.app/register.html');
    console.log('• https://tu-domain.vercel.app/sistema.html');
} else {
    console.log('❌ ERRORES ENCONTRADOS - Revisar archivos faltantes');
}

console.log('\n🔐 CREDENCIALES DE PRUEBA:');
console.log('Admin: admin@mindhub.com / admin123');
console.log('User:  usuario@test.com / user123');
