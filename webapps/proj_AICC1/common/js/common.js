function applyDynamicStyles() {
    const footerElement1 = document.querySelector('#AICC1 footer .foot_container ul');
    const footerElement2 = document.querySelector('#AICC1 footer .f_info ul');

    if (footerElement1) {
        if (footerElement1.offsetWidth <= 840) {
            footerElement1.classList.add('vertical');
        } else {
            footerElement1.classList.remove('vertical');
        }
    }

    if (footerElement2) {
        if (footerElement2.offsetWidth <= 840) {
            footerElement2.classList.add('vertical');
        } else {
            footerElement2.classList.remove('vertical');
        }
    }
}

window.addEventListener('resize', applyDynamicStyles);
document.addEventListener('DOMContentLoaded', applyDynamicStyles);
