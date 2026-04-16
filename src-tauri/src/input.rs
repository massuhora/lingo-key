/// Simulate Ctrl+C to copy the currently selected text to the clipboard.
///
/// This first releases any modifier keys (Ctrl/Shift/Alt/Win) that may still be
/// held down from the global shortcut, then sends Ctrl+C. This avoids
/// producing Ctrl+Shift+C or similar incorrect combinations.
#[cfg(target_os = "windows")]
pub fn simulate_copy() {
    use std::mem;
    use winapi::um::winuser::{
        INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP, SendInput,
        VK_CONTROL, VK_SHIFT, VK_MENU, VK_LWIN, VK_RWIN,
    };

    const VK_C: u16 = 0x43;

    unsafe {
        let mut inputs: Vec<INPUT> = Vec::with_capacity(14);

        // Release all common modifier keys so they don't interfere.
        for vk in [VK_CONTROL, VK_SHIFT, VK_MENU, VK_LWIN, VK_RWIN] {
            let mut input: INPUT = mem::zeroed();
            input.type_ = INPUT_KEYBOARD;
            input.u.ki_mut().wVk = vk as u16;
            input.u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
            inputs.push(input);
        }

        // Ctrl down
        let mut input: INPUT = mem::zeroed();
        input.type_ = INPUT_KEYBOARD;
        input.u.ki_mut().wVk = VK_CONTROL as u16;
        inputs.push(input);

        // C down
        let mut input: INPUT = mem::zeroed();
        input.type_ = INPUT_KEYBOARD;
        input.u.ki_mut().wVk = VK_C;
        inputs.push(input);

        // C up
        let mut input: INPUT = mem::zeroed();
        input.type_ = INPUT_KEYBOARD;
        input.u.ki_mut().wVk = VK_C;
        input.u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
        inputs.push(input);

        // Ctrl up
        let mut input: INPUT = mem::zeroed();
        input.type_ = INPUT_KEYBOARD;
        input.u.ki_mut().wVk = VK_CONTROL as u16;
        input.u.ki_mut().dwFlags = KEYEVENTF_KEYUP;
        inputs.push(input);

        SendInput(
            inputs.len() as u32,
            inputs.as_mut_ptr(),
            mem::size_of::<INPUT>() as i32,
        );
    }
}

#[cfg(not(target_os = "windows"))]
pub fn simulate_copy() {
    // Fallback: no-op on non-Windows platforms.
}
