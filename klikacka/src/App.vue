<template>
    <div class="xp-window">
        <div class="xp-title-bar">
            <div class="xp-title-text">CAPTCHA Clicker.exe</div>
            <div class="xp-button-group">
                <div class="xp-control-btn minimize">_</div>
                <div class="xp-control-btn maximize">□</div>
                <div class="xp-control-btn close">X</div>
            </div>
        </div>
        <div class="xp-nav">
            <RouterLink to="/">Game</RouterLink>
            <RouterLink to="/stats">Stats</RouterLink>
        </div>
        <RouterView />
    </div>
</template>

<style>
/* Global styles are in style.css */
</style>
