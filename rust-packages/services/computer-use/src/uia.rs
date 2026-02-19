use crate::error::{Error, Result};

pub fn ui_tree(_params: &serde_json::Value) -> Result<Option<serde_json::Value>> {
    #[cfg(all(windows, feature = "uia"))]
    {
        return windows_impl(_params);
    }

    #[cfg(not(all(windows, feature = "uia")))]
    {
        let _ = _params;
        return Err(Error::InvalidCommand(
            "UiTree requires Windows and feature flag: --features uia".to_string(),
        ));
    }
}

#[cfg(all(windows, feature = "uia"))]
fn windows_impl(params: &serde_json::Value) -> Result<Option<serde_json::Value>> {
    use windows::core::Interface;
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED,
    };
    use windows::Win32::UI::Accessibility::{CUIAutomation, IUIAutomation, IUIAutomationElement};

    let depth = params.get("depth").and_then(|v| v.as_u64()).unwrap_or(3) as usize;
    let limit = params.get("limit").and_then(|v| v.as_u64()).unwrap_or(200) as usize;

    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED)
            .map_err(|e| Error::Computer(format!("CoInitializeEx failed: {e}")))?;
    }

    struct ComGuard;
    impl Drop for ComGuard {
        fn drop(&mut self) {
            unsafe { CoUninitialize() };
        }
    }
    let _guard = ComGuard;

    let automation: IUIAutomation = unsafe {
        CoCreateInstance(&CUIAutomation, None, CLSCTX_INPROC_SERVER)
            .map_err(|e| Error::Computer(format!("CoCreateInstance(CUIAutomation) failed: {e}")))?
    };

    let focused: IUIAutomationElement = unsafe {
        automation
            .GetFocusedElement()
            .map_err(|e| Error::Computer(format!("GetFocusedElement failed: {e}")))?
    };

    let walker = unsafe {
        automation
            .ControlViewWalker()
            .map_err(|e| Error::Computer(format!("ControlViewWalker failed: {e}")))?
    };

    let mut remaining = limit;
    let node = element_to_json(&focused, Some(&walker), depth, &mut remaining)?;
    Ok(Some(node))
}

#[cfg(all(windows, feature = "uia"))]
fn element_to_json(
    el: &windows::Win32::UI::Accessibility::IUIAutomationElement,
    walker: Option<&windows::Win32::UI::Accessibility::IUIAutomationTreeWalker>,
    depth: usize,
    remaining: &mut usize,
) -> Result<serde_json::Value> {
    use windows::Win32::UI::Accessibility::IUIAutomationElement;

    if *remaining == 0 {
        return Ok(serde_json::json!({
            "truncated": true
        }));
    }
    *remaining -= 1;

    let name = unsafe { el.CurrentName() }
        .map(|b| b.to_string())
        .unwrap_or_default();

    let automation_id = unsafe { el.CurrentAutomationId() }
        .map(|b| b.to_string())
        .unwrap_or_default();

    let class_name = unsafe { el.CurrentClassName() }
        .map(|b| b.to_string())
        .unwrap_or_default();

    let control_type = unsafe { el.CurrentControlType() }.unwrap_or_default();

    let is_enabled = unsafe { el.CurrentIsEnabled() }.map(|v| v.as_bool()).unwrap_or(false);

    let is_offscreen = unsafe { el.CurrentIsOffscreen() }.map(|v| v.as_bool()).unwrap_or(true);

    let rect = unsafe { el.CurrentBoundingRectangle() }
        .map(|r| serde_json::json!({
            "left": r.left,
            "top": r.top,
            "right": r.right,
            "bottom": r.bottom,
        }))
        .unwrap_or_else(|_| serde_json::json!(null));

    let mut children: Vec<serde_json::Value> = Vec::new();

    if depth > 0 {
        if let Some(w) = walker {
            let mut cur: Option<IUIAutomationElement> = unsafe { w.GetFirstChildElement(el) }.ok();
            while let Some(c) = cur {
                let child_json = element_to_json(&c, Some(w), depth - 1, remaining)?;
                children.push(child_json);
                if *remaining == 0 {
                    break;
                }
                cur = unsafe { w.GetNextSiblingElement(&c) }.ok();
            }
        }
    }

    Ok(serde_json::json!({
        "name": name,
        "automation_id": automation_id,
        "class_name": class_name,
        "control_type": control_type,
        "bounding_rect": rect,
        "is_enabled": is_enabled,
        "is_visible": !is_offscreen,
        "children": children,
    }))
}
