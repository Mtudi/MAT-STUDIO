import numpy as np

from golden_dome import Scene, dome_radius


def test_dome_profile_is_onion_shaped():
    t = np.linspace(0, 1, 101)
    r = dome_radius(t)
    assert r[0] > 0.5
    assert r.max() >= 0.95
    assert r[-1] < 0.05


def test_scene_renders_ansi_art():
    scene = Scene(60, 22)
    output = scene.render(0)
    assert "\x1b[38;2;" in output
    assert len(output) > 100
    assert np.any(scene.rgb)
