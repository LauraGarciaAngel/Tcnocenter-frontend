BEGIN;
 
-- ============================================================
-- 1. ROLES
-- ============================================================
INSERT INTO roles (nombre, descripcion) VALUES
('cliente', 'Usuario normal que puede comprar'),
('admin', 'Administrador con acceso total al sistema');
 
-- ============================================================
-- 2. MARCAS
-- ============================================================
INSERT INTO marcas (nombre) VALUES
('Samsung'),
('Apple'),
('Xiaomi'),
('Motorola'),
('Huawei'),
('Tecno'),
('Oppo'),
('Infinix'),
('Nubia');
 
-- ============================================================
-- 3. CATEGORÍAS
-- ============================================================
INSERT INTO categorias (nombre) VALUES
('Celulares');
 
-- ============================================================
-- 4. ETIQUETAS
-- ============================================================
INSERT INTO etiquetas (nombre, color) VALUES
('En oferta', '#E53935'),
('Nuevo', '#43A047');
 
-- ============================================================
-- 5. COLORES
-- ============================================================
INSERT INTO colores (nombre, codigo_hex) VALUES
('Dorado',  '#D4AF37'),
('Gris',    '#808080'),
('Negro',   '#000000'),
('Morado',  '#800080'),
('Azul',    '#2196F3'),
('Blanco',  '#FFFFFF'),
('Celeste', '#87CEEB'),
('Grafito', '#383838'),
('Rosado',  '#FFC0CB'),
('Verde',   '#4CAF50'),
('Rojo',    '#F44336'),
('Plata',   '#C0C0C0');
 
-- ============================================================
-- 6. PRODUCTOS + PRODUCTO_COLORES
-- ============================================================
 
-- 1. Samsung Galaxy S24 Ultra
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Samsung'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Samsung Galaxy S24 Ultra', 'Galaxy S24 Ultra', 'SM-S928B', 200, '6,8″ AMOLED',
    '../assets/images/celulares/01-samsung-galaxy-s24-ultra.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'SM-S928B'), (SELECT id_color FROM colores WHERE nombre = 'Dorado'), 256, 4500000, 5000000, '../assets/images/celulares/01-samsung-galaxy-s24-ultra.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S928B'), (SELECT id_color FROM colores WHERE nombre = 'Gris'),   256, 4500000, 5000000, '../assets/images/celulares/01-samsung-galaxy-s24-ultra-gris.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S928B'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  256, 4500000, 5000000, '../assets/images/celulares/01-samsung-galaxy-s24-ultra-negro.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S928B'), (SELECT id_color FROM colores WHERE nombre = 'Morado'), 256, 4500000, 5000000, '../assets/images/celulares/01-samsung-galaxy-s24-ultra-morado.jpg', 3);
 
-- 2. Apple iPhone 15 Pro
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Apple'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'Nuevo'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Apple iPhone 15 Pro', 'iPhone 15 Pro', 'A3101', 48, '6,1″ OLED',
    '../assets/images/celulares/02-apple-iphone-15-pro.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'A3101'), (SELECT id_color FROM colores WHERE nombre = 'Azul'),   256, 4700000, NULL, '../assets/images/celulares/02-apple-iphone-15-pro.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'A3101'), (SELECT id_color FROM colores WHERE nombre = 'Gris'),   256, 4700000, NULL, '../assets/images/celulares/02-apple-iphone-15-pro-gris.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'A3101'), (SELECT id_color FROM colores WHERE nombre = 'Blanco'), 256, 4700000, NULL, '../assets/images/celulares/02-apple-iphone-15-pro-blanco.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'A3101'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  256, 4700000, NULL, '../assets/images/celulares/02-apple-iphone-15-pro-negro.jpg', 3);
 
-- 3. Samsung Galaxy S24
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Samsung'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Samsung Galaxy S24', 'Galaxy S24', 'SM-S921B', 50, '6,2″ AMOLED',
    '../assets/images/celulares/03-samsung-galaxy-s24.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'SM-S921B'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  128, 3400000, 4000000, '../assets/images/celulares/03-samsung-galaxy-s24.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S921B'), (SELECT id_color FROM colores WHERE nombre = 'Gris'),   128, 3400000, 4000000, '../assets/images/celulares/03-samsung-galaxy-s24-gris.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S921B'), (SELECT id_color FROM colores WHERE nombre = 'Morado'), 128, 3400000, 4000000, '../assets/images/celulares/03-samsung-galaxy-s24-morado.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-S921B'), (SELECT id_color FROM colores WHERE nombre = 'Dorado'), 128, 3400000, 4000000, '../assets/images/celulares/03-samsung-galaxy-s24-dorado.jpg', 3);
 
-- 4. Samsung Galaxy A55 5G
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Samsung'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'Nuevo'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Samsung Galaxy A55 5G', 'Galaxy A55 5G', 'SM-A556B', 50, '6,6″ AMOLED',
    '../assets/images/celulares/04-samsung-galaxy-a55-5g.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'SM-A556B'), (SELECT id_color FROM colores WHERE nombre = 'Celeste'), 256, 1600000, NULL, '../assets/images/celulares/04-samsung-galaxy-a55-5g.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-A556B'), (SELECT id_color FROM colores WHERE nombre = 'Morado'),  256, 1600000, NULL, '../assets/images/celulares/04-samsung-galaxy-a55-5g-morado.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-A556B'), (SELECT id_color FROM colores WHERE nombre = 'Grafito'), 256, 1600000, NULL, '../assets/images/celulares/04-samsung-galaxy-a55-5g-grafito.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'SM-A556B'), (SELECT id_color FROM colores WHERE nombre = 'Dorado'),  256, 1600000, NULL, '../assets/images/celulares/04-samsung-galaxy-a55-5g-dorado.jpg', 3);
 
-- 5. Apple iPhone 15
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Apple'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Apple iPhone 15', 'iPhone 15', 'A3090', 48, '6,1″ OLED',
    '../assets/images/celulares/05-apple-iphone-15.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'A3090'), (SELECT id_color FROM colores WHERE nombre = 'Rosado'),  128, 3600000, 4000000, '../assets/images/celulares/05-apple-iphone-15.jpg', 3),
((SELECT id_producto FROM productos WHERE sku = 'A3090'), (SELECT id_color FROM colores WHERE nombre = 'Celeste'), 128, 3600000, 4000000, '../assets/images/celulares/05-apple-iphone-15-celeste.jpg', 3),
((SELECT id_producto FROM productos WHERE sku = 'A3090'), (SELECT id_color FROM colores WHERE nombre = 'Verde'),   128, 3600000, 4000000, '../assets/images/celulares/05-apple-iphone-15-verde.jpg', 3),
((SELECT id_producto FROM productos WHERE sku = 'A3090'), (SELECT id_color FROM colores WHERE nombre = 'Dorado'),  128, 3600000, 4000000, '../assets/images/celulares/05-apple-iphone-15-dorado.jpg', 3),
((SELECT id_producto FROM productos WHERE sku = 'A3090'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),   128, 3600000, 4000000, '../assets/images/celulares/05-apple-iphone-15-negro.jpg', 3);
 
-- 6. Xiaomi Redmi Note 13 Pro 5G
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Xiaomi'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Xiaomi Redmi Note 13 Pro 5G', 'Redmi Note 13 Pro 5G', '2312DRA50G', 200, '6,67″ AMOLED',
    '../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = '2312DRA50G'), (SELECT id_color FROM colores WHERE nombre = 'Morado'),  256, 1350000, 1500000, '../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = '2312DRA50G'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),   256, 1350000, 1500000, '../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g-negro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = '2312DRA50G'), (SELECT id_color FROM colores WHERE nombre = 'Celeste'), 256, 1350000, 1500000, '../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g-celeste.jpg', 5);
 
-- 7. Xiaomi 14
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Xiaomi'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'Nuevo'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Xiaomi 14', 'Xiaomi 14', '23127PN0CG', 50, '6,36″ AMOLED',
    '../assets/images/celulares/07-xiaomi-xiaomi-14.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = '23127PN0CG'), (SELECT id_color FROM colores WHERE nombre = 'Blanco'), 512, 3300000, NULL, '../assets/images/celulares/07-xiaomi-xiaomi-14.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = '23127PN0CG'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  512, 3300000, NULL, '../assets/images/celulares/07-xiaomi-xiaomi-14-negro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = '23127PN0CG'), (SELECT id_color FROM colores WHERE nombre = 'Verde'),  512, 3300000, NULL, '../assets/images/celulares/07-xiaomi-xiaomi-14-verde.jpg', 5);
 
-- 8. Motorola Edge 40 Neo
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Motorola'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Motorola Edge 40 Neo', 'Edge 40 Neo', 'XT2307-1', 50, '6,55″ pOLED',
    '../assets/images/celulares/08-motorola-edge-40-neo.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'XT2307-1'), (SELECT id_color FROM colores WHERE nombre = 'Azul'),    256, 1500000, 1875000, '../assets/images/celulares/08-motorola-edge-40-neo.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'XT2307-1'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),   256, 1500000, 1875000, '../assets/images/celulares/08-motorola-edge-40-neo-negro.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'XT2307-1'), (SELECT id_color FROM colores WHERE nombre = 'Celeste'), 256, 1500000, 1875000, '../assets/images/celulares/08-motorola-edge-40-neo-celeste.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'XT2307-1'), (SELECT id_color FROM colores WHERE nombre = 'Rosado'),  256, 1500000, 1875000, '../assets/images/celulares/08-motorola-edge-40-neo-rosado.jpg', 3);
 
-- 9. Motorola Moto G84 5G
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Motorola'),
    NULL,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Motorola Moto G84 5G', 'Moto G84 5G', 'XT2347-2', 50, '6,5″ pOLED',
    '../assets/images/celulares/09-motorola-moto-g84-5g.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'XT2347-2'), (SELECT id_color FROM colores WHERE nombre = 'Rojo'),    256, 1000000, NULL, '../assets/images/celulares/09-motorola-moto-g84-5g.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'XT2347-2'), (SELECT id_color FROM colores WHERE nombre = 'Celeste'), 256, 1000000, NULL, '../assets/images/celulares/09-motorola-moto-g84-5g-celeste.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'XT2347-2'), (SELECT id_color FROM colores WHERE nombre = 'Grafito'), 256, 1000000, NULL, '../assets/images/celulares/09-motorola-moto-g84-5g-grafito.jpg', 5);
 
-- 10. Huawei Pura 70 Pro
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Huawei'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'Nuevo'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Huawei Pura 70 Pro', 'Pura 70 Pro', 'HBN-LX9', 50, '6,8″ LTPO OLED',
    '../assets/images/celulares/10-huawei-pura-70-pro.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'HBN-LX9'), (SELECT id_color FROM colores WHERE nombre = 'Morado'), 512, 4200000, NULL, '../assets/images/celulares/10-huawei-pura-70-pro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'HBN-LX9'), (SELECT id_color FROM colores WHERE nombre = 'Blanco'), 512, 4200000, NULL, '../assets/images/celulares/10-huawei-pura-70-pro-blanco.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'HBN-LX9'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  512, 4200000, NULL, '../assets/images/celulares/10-huawei-pura-70-pro-negro.jpg', 5);
 
-- 11. Tecno Camon 30 Pro 5G
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Tecno'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Tecno Camon 30 Pro 5G', 'Camon 30 Pro 5G', 'CL8', 50, '6,78″ AMOLED',
    '../assets/images/celulares/11-tecno-camon-30-pro-5g.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'CL8'), (SELECT id_color FROM colores WHERE nombre = 'Verde'), 256, 1400000, 1750000, '../assets/images/celulares/11-tecno-camon-30-pro-5g.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'CL8'), (SELECT id_color FROM colores WHERE nombre = 'Plata'), 256, 1400000, 1750000, '../assets/images/celulares/11-tecno-camon-30-pro-5g-plata.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'CL8'), (SELECT id_color FROM colores WHERE nombre = 'Negro'), 256, 1400000, 1750000, '../assets/images/celulares/11-tecno-camon-30-pro-5g-negro.jpg', 5);
 
-- 12. Tecno Spark 20 Pro
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Tecno'),
    NULL,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Tecno Spark 20 Pro', 'Spark 20 Pro', 'KJ6', 108, '6,78″ LCD',
    '../assets/images/celulares/12-tecno-spark-20-pro.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'KJ6'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  256, 800000, NULL, '../assets/images/celulares/12-tecno-spark-20-pro.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'KJ6'), (SELECT id_color FROM colores WHERE nombre = 'Blanco'), 256, 800000, NULL, '../assets/images/celulares/12-tecno-spark-20-pro-blanco.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'KJ6'), (SELECT id_color FROM colores WHERE nombre = 'Dorado'), 256, 800000, NULL, '../assets/images/celulares/12-tecno-spark-20-pro-dorado.jpg', 4),
((SELECT id_producto FROM productos WHERE sku = 'KJ6'), (SELECT id_color FROM colores WHERE nombre = 'Verde'),  256, 800000, NULL, '../assets/images/celulares/12-tecno-spark-20-pro-verde.jpg', 3);
 
-- 13. Oppo Reno11 5G
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Oppo'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Oppo Reno11 5G', 'Reno11 5G', 'CPH2599', 50, '6,7″ AMOLED',
    '../assets/images/celulares/13-oppo-reno11-5g.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'CPH2599'), (SELECT id_color FROM colores WHERE nombre = 'Verde'), 256, 1900000, 2000000, '../assets/images/celulares/13-oppo-reno11-5g.jpg', 8),
((SELECT id_producto FROM productos WHERE sku = 'CPH2599'), (SELECT id_color FROM colores WHERE nombre = 'Gris'),  256, 1900000, 2000000, '../assets/images/celulares/13-oppo-reno11-5g-gris.jpg', 7);
 
-- 14. Oppo A78
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Oppo'),
    NULL,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Oppo A78', 'A78', 'CPH2565', 50, '6,43″ AMOLED',
    '../assets/images/celulares/14-oppo-a78.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'CPH2565'), (SELECT id_color FROM colores WHERE nombre = 'Verde'),  128, 700000, NULL, '../assets/images/celulares/14-oppo-a78.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'CPH2565'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),  128, 700000, NULL, '../assets/images/celulares/14-oppo-a78-negro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'CPH2565'), (SELECT id_color FROM colores WHERE nombre = 'Morado'), 128, 700000, NULL, '../assets/images/celulares/14-oppo-a78-morado.jpg', 5);
 
-- 15. Infinix GT 20 Pro
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Infinix'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'En oferta'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Infinix GT 20 Pro', 'GT 20 Pro', 'X6871', 108, '6,78″ AMOLED',
    '../assets/images/celulares/15-infinix-gt-20-pro.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'X6871'), (SELECT id_color FROM colores WHERE nombre = 'Plata'),   256, 1000000, 1250000, '../assets/images/celulares/15-infinix-gt-20-pro-plata.jpg', 8),
((SELECT id_producto FROM productos WHERE sku = 'X6871'), (SELECT id_color FROM colores WHERE nombre = 'Grafito'), 256, 1000000, 1250000, '../assets/images/celulares/15-infinix-gt-20-pro-grafito.jpg', 7);
 
-- 16. Nubia Red Magic 9 Pro
INSERT INTO productos (id_marca, id_etiqueta, id_categoria, nombre, modelo, sku, camara, pantalla, producto_url)
VALUES (
    (SELECT id_marca FROM marcas WHERE nombre = 'Nubia'),
    (SELECT id_etiqueta FROM etiquetas WHERE nombre = 'Nuevo'),
    (SELECT id_categoria FROM categorias WHERE nombre = 'Celulares'),
    'Nubia Red Magic 9 Pro', 'Red Magic 9 Pro', 'NX769J', 50, '6,8″ AMOLED',
    '../assets/images/celulares/16-nubia-red-magic-9-pro.jpg'
);
 
INSERT INTO producto_colores (id_producto, id_color, almacenamiento, precio, precio_anterior, imagen_url, stock) VALUES
((SELECT id_producto FROM productos WHERE sku = 'NX769J'), (SELECT id_color FROM colores WHERE nombre = 'Grafito'), 512, 3600000, NULL, '../assets/images/celulares/16-nubia-red-magic-9-pro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'NX769J'), (SELECT id_color FROM colores WHERE nombre = 'Negro'),   512, 3600000, NULL, '../assets/images/celulares/16-nubia-red-magic-9-pro-negro.jpg', 5),
((SELECT id_producto FROM productos WHERE sku = 'NX769J'), (SELECT id_color FROM colores WHERE nombre = 'Plata'),   512, 3600000, NULL, '../assets/images/celulares/16-nubia-red-magic-9-pro-plata.jpg', 5);
 
COMMIT;