/* Native canvas and SVG effects: no external animation runtime. */
(function () {
    function initAtmosphere() {
        const sky = document.querySelector(".drawn-bg-canvas");
        const clicks = document.querySelector(".drawn-click-canvas");
        if (!sky || !clicks) return;
        const ctx = sky.getContext("2d");
        const fx = clicks.getContext("2d");
        if (!ctx || !fx) return;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const compactQuery = window.matchMedia("(max-width: 700px)");
        let reduced = motionQuery.matches;
        let width = 0;
        let height = 0;
        let frame = 0;
        let previousRender = 0;
        let elapsed = 0;
        let nextMeteor = 0.9;
        let palette;
        let dark = false;
        let pointerDown = null;
        let resizeFrame = 0;
        let lastBurst = null;
        const finePointer = window.matchMedia("(pointer: fine)");
        const cursor = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 15, opacity: 0,
            visible: false, pressed: false, interactive: false, trail: [] };
        const transferKey = "drawn-click-feedback";
        const bursts = [];
        const meteors = [];
        const stars = [];
        let connections = [];
        // Stable normalized positions avoid redistributing the sky on small resizes.
        let seed = 84617;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 160; i += 1) {
            stars.push({ x: random(), y: random(), radius: 0.6 + random() * 1.05,
                depth: 0.35 + random() * 0.65, phase: random() * Math.PI * 2,
                speed: 0.5 + random() * 0.7, tint: Math.floor(random() * 3), cross: i % 19 === 0 });
        }
        const swimmers = Array.from(document.querySelectorAll("[data-swimmer]")).map((node, index) => ({
            node, direction: Number(node.dataset.direction), start: [0.16, 0.76][index],
            x: 0, phase: index * 2.3, speed: [18, 15][index], size: 0
        }));

        function updatePalette() {
            dark = document.documentElement.dataset.scheme === "dark";
            palette = dark ? {
                stars: ["205, 225, 255", "155, 205, 237", "232, 210, 170"],
                line: "130, 173, 218", meteor: "167, 222, 251",
                particles: ["152, 221, 247", "193, 177, 255", "240, 210, 167"],
                core: "240, 250, 255"
            } : {
                stars: ["89, 114, 174", "92, 148, 169", "163, 129, 160"],
                line: "115, 135, 184", meteor: "103, 133, 200",
                particles: ["89, 139, 198", "157, 118, 195", "196, 137, 157"],
                core: "139, 119, 192"
            };
        }

        function resize() {
            const oldWidth = width;
            width = window.innerWidth;
            height = window.innerHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, compactQuery.matches ? 1.5 : 2);
            [sky, clicks].forEach(canvas => {
                canvas.width = Math.round(width * ratio);
                canvas.height = Math.round(height * ratio);
            });
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            fx.setTransform(ratio, 0, 0, ratio, 0, 0);
            swimmers.forEach(item => {
                item.node.style.left = "0px";
                item.size = item.node.offsetWidth;
                item.x = oldWidth ? item.x / oldWidth * width : width * item.start;
            });
            // A few precomputed constellation segments, rather than an all-pairs particle mesh.
            const pairs = [];
            for (let i = 0; i < 35; i += 1) {
                for (let j = i + 1; j < 35; j += 1) {
                    const distance = Math.hypot((stars[i].x - stars[j].x) * width, (stars[i].y - stars[j].y) * height);
                    if (distance > 32 && distance < 145) pairs.push({ i, j, distance });
                }
            }
            connections = pairs.sort((a, b) => a.distance - b.distance).slice(0, compactQuery.matches ? 4 : 9);
            paintSky();
            moveWhales(0);
        }

        function starPoint(star) {
            return { x: star.x * width, y: star.y * height };
        }

        function paintSky() {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = `rgba(${palette.line}, ${dark ? 0.2 : 0.15})`;
            connections.forEach(({ i, j }) => {
                const a = starPoint(stars[i]);
                const b = starPoint(stars[j]);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            });
            const count = compactQuery.matches ? 58 : Math.min(160, Math.max(95, Math.floor(width * height / 8000)));
            for (let i = 0; i < count; i += 1) {
                const star = stars[i];
                const { x, y } = starPoint(star);
                const twinkle = reduced ? 0.8 : 0.64 + 0.36 * Math.sin(elapsed * star.speed + star.phase);
                const alpha = (dark ? 0.55 : 0.44) * star.depth + twinkle * (dark ? 0.4 : 0.3);
                const color = palette.stars[star.tint];
                const radius = star.radius * (star.cross ? 1.2 : 1);
                if (star.radius > 1.1) {
                    const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.5);
                    halo.addColorStop(0, `rgba(${color}, ${alpha * (dark ? 0.28 : 0.13)})`);
                    halo.addColorStop(1, `rgba(${color}, 0)`);
                    ctx.fillStyle = halo;
                    ctx.beginPath(); ctx.arc(x, y, radius * 4.5, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = `rgba(${color}, ${alpha})`;
                ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
                if (star.cross) {
                    const length = 3.5 + twinkle * 2;
                    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.65})`;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath(); ctx.moveTo(x - length, y); ctx.lineTo(x + length, y);
                    ctx.moveTo(x, y - length); ctx.lineTo(x, y + length); ctx.stroke();
                }
            }
        }

        function paintMeteors(delta) {
            const limit = compactQuery.matches ? 2 : 3;
            if (elapsed > nextMeteor && meteors.length < limit) {
                const count = Math.min(limit - meteors.length, random() < (compactQuery.matches ? 0.1 : 0.25) ? 2 : 1);
                for (let i = 0; i < count; i += 1) {
                    meteors.push({ x: width * (0.3 + random() * 0.65), y: height * (0.04 + random() * 0.3),
                        vx: -260 - random() * 100, vy: 140 + random() * 75,
                        age: 0, life: 0.9 + random() * 0.4, length: compactQuery.matches ? 75 : 130 });
                }
                nextMeteor = elapsed + (compactQuery.matches ? 4 : 3) + random() * 2.5;
            }
            for (let i = meteors.length - 1; i >= 0; i -= 1) {
                const meteor = meteors[i];
                meteor.age += delta;
                if (meteor.age > meteor.life) { meteors.splice(i, 1); continue; }
                meteor.x += meteor.vx * delta; meteor.y += meteor.vy * delta;
                const speed = Math.hypot(meteor.vx, meteor.vy);
                const tailX = meteor.x - meteor.vx / speed * meteor.length;
                const tailY = meteor.y - meteor.vy / speed * meteor.length;
                const alpha = Math.sin(meteor.age / meteor.life * Math.PI) * (dark ? 0.85 : 0.6);
                const trail = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
                trail.addColorStop(0, `rgba(${palette.meteor}, 0)`);
                trail.addColorStop(1, `rgba(${palette.meteor}, ${alpha})`);
                ctx.strokeStyle = trail; ctx.lineWidth = 1.5; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(meteor.x, meteor.y); ctx.stroke();
                ctx.fillStyle = `rgba(${palette.stars[0]}, ${alpha})`;
                ctx.beginPath(); ctx.arc(meteor.x, meteor.y, 1.7, 0, Math.PI * 2); ctx.fill();
            }
        }

        function moveWhales(delta) {
            swimmers.forEach(item => {
                const speed = item.speed * (compactQuery.matches ? 0.65 : 1) * item.direction;
                if (!reduced) item.x += speed * delta;
                // Wrap only after the entire whale leaves the viewport. Its head always faces travel.
                if (item.x > width + 20) item.x = -item.size - 20;
                if (item.x < -item.size - 20) item.x = width + 20;
                const t = reduced ? item.phase : elapsed * 0.55 + item.phase;
                const y = Math.sin(t) * 4 + Math.sin(t * 0.47) * 1.5;
                const verticalVelocity = Math.cos(t) * 2.2 + Math.cos(t * 0.47) * 0.4;
                const angle = reduced ? 0 : Math.max(-5, Math.min(5, Math.atan(verticalVelocity / speed) * 180 / Math.PI));
                item.node.style.transform = `translate3d(${item.x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(2)}deg)`;
            });
        }

        function diamond(x, y, radius, rotation) {
            fx.save(); fx.translate(x, y); fx.rotate(rotation);
            fx.beginPath(); fx.moveTo(0, -radius); fx.quadraticCurveTo(radius * 0.2, -radius * 0.2, radius * 0.65, 0);
            fx.quadraticCurveTo(radius * 0.2, radius * 0.2, 0, radius);
            fx.quadraticCurveTo(-radius * 0.2, radius * 0.2, -radius * 0.65, 0);
            fx.quadraticCurveTo(-radius * 0.2, -radius * 0.2, 0, -radius); fx.fill(); fx.restore();
        }

        function paintBursts(now) {
            fx.clearRect(0, 0, width, height);
            for (let i = bursts.length - 1; i >= 0; i -= 1) {
                const burst = bursts[i];
                const time = (now - burst.started) / 1000;
                if (time > 0.9) { bursts.splice(i, 1); continue; }
                const progress = time / 0.9;
                const ease = 1 - Math.pow(1 - progress, 3);
                const fade = Math.pow(1 - progress, 1.5);
                const radius = (10 + 29 * ease) * burst.scale;
                fx.strokeStyle = `rgba(${palette.particles[0]}, ${fade * 0.65})`;
                fx.lineWidth = 1.1;
                fx.beginPath(); fx.arc(burst.x, burst.y, radius, 0, Math.PI * 2); fx.stroke();
                burst.particles.forEach(particle => {
                    const distance = particle.distance * ease * burst.scale;
                    const x = burst.x + Math.cos(particle.angle) * distance;
                    const y = burst.y + Math.sin(particle.angle) * distance + time * time * 12;
                    const color = palette.particles[particle.tint];
                    fx.fillStyle = `rgba(${color}, ${fade * 0.95})`;
                    if (particle.star) diamond(x, y, particle.size * (1 - progress * 0.65), particle.angle + time * 0.8);
                    else { fx.beginPath(); fx.arc(x, y, particle.size * fade, 0, Math.PI * 2); fx.fill(); }
                });
                fx.fillStyle = `rgba(${palette.core}, ${Math.max(0, 1 - progress * 3) * 0.8})`;
                diamond(burst.x, burst.y, 7 * (1 - progress), Math.PI / 4);
            }
        }

        function burstAt(event) {
            const scale = event.pointerType === "touch" ? 0.7 : 1;
            const count = compactQuery.matches ? 9 : 15;
            const particles = Array.from({ length: count }, (_, i) => ({
                angle: Math.PI * 2 * i / count + random() * 0.22,
                distance: 23 + random() * 37, size: i % 3 === 0 ? 3 + random() * 2 : 0.9 + random(),
                star: i % 3 === 0, tint: i % 3
            }));
            if (bursts.length >= 6) bursts.shift();
            lastBurst = { x: event.clientX, y: event.clientY, scale, particles, started: performance.now() };
            bursts.push(lastBurst);
            paintBursts(performance.now());
            return lastBurst;
        }

        function paintCursor(now, delta) {
            if (!finePointer.matches || reduced) return;
            const easing = 1 - Math.exp(-delta * 18);
            cursor.x += (cursor.targetX - cursor.x) * easing;
            cursor.y += (cursor.targetY - cursor.y) * easing;
            cursor.opacity += ((cursor.visible ? 1 : 0) - cursor.opacity) * easing;
            cursor.radius += ((cursor.pressed ? 9 : cursor.interactive ? 23 : 15) - cursor.radius) * easing;
            if (cursor.opacity < 0.01) return;
            const previous = cursor.trail[cursor.trail.length - 1];
            if (!previous || Math.hypot(cursor.x - previous.x, cursor.y - previous.y) > 4) {
                cursor.trail.push({ x: cursor.x, y: cursor.y, time: now });
            }
            cursor.trail = cursor.trail.filter(point => now - point.time < 230).slice(-7);
            cursor.trail.forEach((point, index) => {
                const alpha = (1 - (now - point.time) / 230) * cursor.opacity * 0.34;
                fx.fillStyle = `rgba(${palette.particles[index % 3]}, ${alpha})`;
                fx.beginPath(); fx.arc(point.x, point.y, 1.2, 0, Math.PI * 2); fx.fill();
            });
            const glow = fx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 34);
            glow.addColorStop(0, `rgba(${palette.particles[0]}, ${cursor.opacity * (dark ? 0.11 : 0.065)})`);
            glow.addColorStop(1, `rgba(${palette.particles[0]}, 0)`);
            fx.fillStyle = glow; fx.beginPath(); fx.arc(cursor.x, cursor.y, 34, 0, Math.PI * 2); fx.fill();
            fx.strokeStyle = `rgba(${palette.particles[1]}, ${cursor.opacity * 0.7})`;
            fx.lineWidth = 1.1;
            fx.beginPath(); fx.arc(cursor.x, cursor.y, cursor.radius, 0, Math.PI * 2); fx.stroke();
            fx.fillStyle = `rgba(${palette.particles[0]}, ${cursor.opacity * 0.85})`;
            fx.beginPath(); fx.arc(cursor.targetX, cursor.targetY, 1.8, 0, Math.PI * 2); fx.fill();
        }

        function restoreClickFeedback() {
            try {
                const saved = window.sessionStorage?.getItem(transferKey);
                if (!saved) return;
                window.sessionStorage.removeItem(transferKey);
                const record = JSON.parse(saved);
                if (reduced || record.destination !== window.location.pathname + window.location.search || Date.now() - record.savedAt > 2500) return;
                if (!Array.isArray(record.particles) || record.particles.length > 20) return;
                const age = Math.min(240, Math.max(0, record.age + Date.now() - record.savedAt));
                lastBurst = { x: Math.max(0, Math.min(width, record.x)), y: Math.max(0, Math.min(height, record.y)),
                    scale: record.scale, particles: record.particles, started: performance.now() - age };
                bursts.push(lastBurst);
                paintBursts(performance.now());
            } catch (_) { /* Navigation and effects still work when storage is unavailable. */ }
        }

        function tick(now) {
            frame = 0;
            if (document.hidden || reduced) return;
            if (now - previousRender >= 1000 / (compactQuery.matches ? 30 : 45)) {
                const delta = previousRender ? Math.min((now - previousRender) / 1000, 0.05) : 0;
                previousRender = now; elapsed += delta;
                paintSky(); paintMeteors(delta); moveWhales(delta); paintBursts(now); paintCursor(now, delta);
            }
            frame = requestAnimationFrame(tick);
        }

        function resume() {
            if (frame) cancelAnimationFrame(frame);
            frame = 0; previousRender = 0;
            document.documentElement.dataset.atmospherePaused = String(document.hidden);
            if (document.hidden) { cursor.visible = false; cursor.opacity = 0; return; }
            paintSky(); moveWhales(0);
            if (!reduced) frame = requestAnimationFrame(tick);
        }

        const isEditing = target => Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
        document.addEventListener("pointermove", event => {
            if (!finePointer.matches || event.pointerType === "touch" || reduced) return;
            if (!cursor.visible) { cursor.x = event.clientX; cursor.y = event.clientY; }
            cursor.targetX = event.clientX; cursor.targetY = event.clientY;
            cursor.visible = !isEditing(event.target);
            cursor.interactive = Boolean(event.target?.closest("a, button, summary, [role='button']"));
        }, { passive: true, capture: true });
        document.addEventListener("pointerout", event => {
            if (!event.relatedTarget) cursor.visible = false;
        }, { passive: true });
        document.addEventListener("pointerdown", event => {
            pointerDown = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY, id: event.pointerId, fired: false } : null;
            cursor.pressed = Boolean(pointerDown);
            // Paint on press, before a link's click can navigate away.
            if (pointerDown && !reduced && event.pointerType !== "touch" && !isEditing(event.target)) {
                burstAt(event); pointerDown.fired = true;
            }
        }, { passive: true, capture: true });
        document.addEventListener("pointercancel", () => { pointerDown = null; cursor.pressed = false; }, { passive: true });
        document.addEventListener("pointerup", event => {
            const down = pointerDown; pointerDown = null; cursor.pressed = false;
            if (reduced || !down || down.fired || down.id !== event.pointerId || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8) return;
            if (isEditing(event.target) || window.getSelection()?.toString()) return;
            burstAt(event);
        }, { passive: true, capture: true });
        document.addEventListener("click", event => {
            const anchor = event.target?.closest("a[href]");
            if (reduced || !anchor || event.defaultPrevented || event.detail === 0 || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
            try {
                const destination = new URL(anchor.href, window.location.href);
                if (destination.origin !== window.location.origin || destination.pathname + destination.search === window.location.pathname + window.location.search) return;
                if (!lastBurst || performance.now() - lastBurst.started > 600) burstAt(event);
                // Continue the same burst on the destination page; never delay or cancel navigation.
                window.sessionStorage?.setItem(transferKey, JSON.stringify({ ...lastBurst,
                    age: performance.now() - lastBurst.started, savedAt: Date.now(),
                    destination: destination.pathname + destination.search }));
            } catch (_) { /* Storage restrictions must not alter normal links. */ }
        }, { capture: true });
        finePointer.addEventListener?.("change", () => { cursor.visible = false; cursor.trail = []; });
        window.addEventListener("resize", () => {
            if (resizeFrame) cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resize(); });
        }, { passive: true });
        document.addEventListener("visibilitychange", resume);
        motionQuery.addEventListener("change", () => {
            reduced = motionQuery.matches;
            bursts.length = 0; meteors.length = 0; fx.clearRect(0, 0, width, height); resume();
        });
        new MutationObserver(() => { updatePalette(); if (reduced) paintSky(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme"] });
        updatePalette(); resize(); restoreClickFeedback(); resume();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAtmosphere, { once: true });
    else initAtmosphere();
})();
