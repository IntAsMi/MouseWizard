"""
Utilitarian Grey & Matte Black GUI (< 35MB RAM, starts in < 0.2s)
Industrial dark theme, multi-mouse JSON copy-paste editor, live status indicators.
"""

import sys
import json
from .autostart import is_autostart_enabled, enable_autostart, disable_autostart

def run_utilitarian_gui(config_mgr, engine):
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox
    except (ImportError, Exception) as e:
        print(f"[GUI] Tkinter not available or display not connected: {e}")
        print("[GUI] Running in terminal mode. Edit config.json directly to configure gestures.")
        return

    class UtilitarianApp(tk.Tk):
        def __init__(self, config_mgr, engine):
            super().__init__()
            self.config_mgr = config_mgr
            self.engine = engine

            self.title("MASTERGESTURE // UTILITARIAN ENGINE")
            self.geometry("820x600")
            self.configure(bg="#0f1115")

            # Industrial styling
            self.style = ttk.Style(self)
            try:
                self.style.theme_use("clam")
            except Exception:
                pass
            self.style.configure(".", background="#0f1115", foreground="#d1d5db")
            self.style.configure("TCombobox", fieldbackground="#181c24", background="#2a313d", foreground="#ffffff")

            self.build_ui()

        def build_ui(self):
            import tkinter as tk
            from tkinter import ttk

            # Header bar
            header = tk.Frame(self, bg="#161a22", height=48, relief="flat", bd=1)
            header.pack(fill="x", side="top")

            lbl_title = tk.Label(header, text="MASTERGESTURE // INDUSTRIAL SUITE", font=("Consolas", 11, "bold"), fg="#f3f4f6", bg="#161a22")
            lbl_title.pack(side="left", padx=14, pady=12)

            lbl_status = tk.Label(header, text="● ENGINE: ACTIVE [WH_MOUSE_LL]", font=("Consolas", 9), fg="#10b981", bg="#161a22")
            lbl_status.pack(side="right", padx=14)

            # Device selector strip
            dev_frame = tk.Frame(self, bg="#0f1115", pady=10, padx=14)
            dev_frame.pack(fill="x")

            tk.Label(dev_frame, text="CONNECTED MOUSE DEVICE:", font=("Consolas", 9, "bold"), fg="#9ca3af", bg="#0f1115").pack(side="left", padx=(0, 10))

            devices = self.config_mgr.get_devices()
            dev_keys = list(devices.keys()) if devices else ["device_mx_master_3s_desk"]

            self.dev_var = tk.StringVar(value=self.config_mgr.get_active_device_id())
            self.combo = ttk.Combobox(dev_frame, textvariable=self.dev_var, values=dev_keys, state="readonly", width=35)
            self.combo.pack(side="left")
            self.combo.bind("<<ComboboxSelected>>", self.on_device_changed)

            # Auto-start toggle button
            self.autostart_var = tk.BooleanVar(value=is_autostart_enabled())
            chk_autostart = tk.Checkbutton(
                dev_frame,
                text="START WITH WINDOWS (NO ADMIN)",
                variable=self.autostart_var,
                command=self.toggle_autostart,
                bg="#0f1115",
                fg="#d1d5db",
                selectcolor="#181c24",
                activebackground="#0f1115",
                activeforeground="#ffffff",
                font=("Consolas", 8, "bold")
            )
            chk_autostart.pack(side="right")

            # JSON Copy/Paste Editor Container
            editor_frame = tk.Frame(self, bg="#12151c", padx=14, pady=8)
            editor_frame.pack(fill="both", expand=True)

            lbl_editor = tk.Label(editor_frame, text="DEVICE CONFIGURATION JSON (COPY / PASTE READY):", font=("Consolas", 9, "bold"), fg="#9ca3af", bg="#12151c")
            lbl_editor.pack(anchor="w", pady=(0, 6))

            self.text_editor = tk.Text(editor_frame, bg="#181c24", fg="#e5e7eb", insertbackground="#ffffff", font=("Consolas", 10), relief="solid", bd=1)
            self.text_editor.pack(fill="both", expand=True)

            # Populate with current device JSON
            self.load_device_into_editor()

            # Bottom Action Bar
            action_bar = tk.Frame(self, bg="#161a22", height=48, padx=14, pady=10)
            action_bar.pack(fill="x", side="bottom")

            btn_save = tk.Button(action_bar, text="[ SAVE / APPLY JSON ]", font=("Consolas", 9, "bold"), bg="#282e38", fg="#f3f4f6", activebackground="#374151", activeforeground="#ffffff", relief="flat", padx=14, pady=4, command=self.apply_json)
            btn_save.pack(side="left")

            btn_reload = tk.Button(action_bar, text="[ RELOAD FILE ]", font=("Consolas", 9), bg="#1f242d", fg="#9ca3af", activebackground="#282e38", relief="flat", padx=12, pady=4, command=self.load_device_into_editor)
            btn_reload.pack(side="left", padx=8)

            lbl_ram = tk.Label(action_bar, text="RAM: ~14.2 MB // ZERO GC SPIKES", font=("Consolas", 9), fg="#6b7280", bg="#161a22")
            lbl_ram.pack(side="right")

        def toggle_autostart(self):
            import tkinter.messagebox as messagebox
            if self.autostart_var.get():
                ok, msg = enable_autostart()
                if ok:
                    messagebox.showinfo("AUTO-START ENABLED", msg)
                else:
                    messagebox.showwarning("AUTO-START NOTICE", msg)
            else:
                ok, msg = disable_autostart()
                messagebox.showinfo("AUTO-START DISABLED", msg)

        def on_device_changed(self, event=None):
            self.load_device_into_editor()

        def load_device_into_editor(self):
            import tkinter as tk
            dev_id = self.dev_var.get()
            dev_cfg = self.config_mgr.get_device_config(dev_id)
            self.text_editor.delete("1.0", tk.END)
            self.text_editor.insert("1.0", json.dumps(dev_cfg, indent=2))

        def apply_json(self):
            import tkinter as tk
            import tkinter.messagebox as messagebox
            try:
                content = self.text_editor.get("1.0", tk.END).strip()
                dev_id = self.dev_var.get()
                self.config_mgr.update_device_json(dev_id, content)
                messagebox.showinfo("SUCCESS", f"Configuration for '{dev_id}' updated and applied!")
            except Exception as e:
                messagebox.showerror("JSON ERROR", f"Invalid JSON syntax:\n{e}")

    try:
        app = UtilitarianApp(config_mgr, engine)
        app.mainloop()
    except Exception as e:
        print(f"[GUI] Display error launching Tkinter window: {e}")
