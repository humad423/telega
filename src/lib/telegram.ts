import sharp from 'sharp';
import { createClient } from '@/utils/supabase/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function fetchAndProcessTelegramLink(url: string) {
    try {
        if (!BOT_TOKEN) {
            throw new Error('Telegram Bot Token is not configured in .env.local');
        }

        // 1. Normalize & Extract Identifier
        let identifier = url.trim();
        if (identifier.includes('t.me/')) {
            identifier = identifier.split('t.me/').pop()?.split('?')[0].split('/')[0] || '';
        }
        if (identifier.startsWith('@')) {
            identifier = identifier.substring(1);
        }

        // Remove trailing slashes
        identifier = identifier.replace(/\/$/, '');

        if (!identifier) {
            throw new Error('Invalid Telegram link or username');
        }

        const chatId = `@${identifier}`;

        // 2. Fetch Chat Info (getChat) - First Pass by handle
        let chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`);
        let chatData = await chatRes.json();

        if (!chatData.ok) {
            throw new Error(`Telegram API Error: ${chatData.description}`);
        }

        let result = chatData.result;
        const numericId = result.id;

        // 🔄 Second Pass: Fetch by numeric ID (Often unlocks more granular fields like verification status)
        try {
            const secondPassRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${numericId}`);
            const secondPassData = await secondPassRes.json();
            if (secondPassData.ok) {
                result = { ...result, ...secondPassData.result };
            }
        } catch (e) {
            console.error('Second pass fetch failed:', e);
        }

        const title = result.title || result.first_name || identifier;
        const description = result.description || result.bio || '';

        // 🛡️ 2026 Definitive Verification Logic
        const checkVerifiedRecursive = (obj: any): boolean => {
            if (!obj || typeof obj !== 'object') return false;

            const keys = Object.keys(obj);
            for (const key of keys) {
                const lowerKey = key.toLowerCase();
                const value = obj[key];

                // Primary check for modern 'is_verified' and 'verification' fields
                if (lowerKey === 'is_verified' || lowerKey === 'verified' || lowerKey === 'is_official') {
                    if (value === true || value === 1 || value === 'true' || value === 'verified') {
                        return true;
                    }
                }

                // Check for 'verification' object (new standard in Bot API 8.2+)
                if (lowerKey === 'verification' && typeof value === 'object' && value !== null) {
                    // Check sub-fields of verification object
                    if (value.status === 'verified' || value.icon || Object.keys(value).length > 0) {
                        return true;
                    }
                }

                // Check for custom emoji status associated with verification
                if (lowerKey === 'verification_custom_emoji_id' && value) return true;
                if (lowerKey === 'emoji_status_custom_emoji_id' && (value === '5402434680072023901' || value === '5402434680072023902')) return true;

                // Recurse into nested objects
                if (typeof value === 'object' && value !== null) {
                    if (checkVerifiedRecursive(value)) return true;
                }
            }
            return false;
        };

        const isVerifiedAPI = checkVerifiedRecursive(result);

        // 🌐 NEW: Hybrid Web Check (Bypasses 2026 Bot API masking for verified status)
        let isVerifiedWeb = false;
        try {
            const webRes = await fetch(`https://t.me/s/${identifier}`, {
                signal: AbortSignal.timeout(3000) // 3-second safety timeout
            });
            const html = await webRes.text();
            // Look for the specific verification icon class used in Telegram's web preview
            if (html.includes('tgme_icon_verified') || html.includes('verified-icon') || html.includes('</i>✔')) {
                isVerifiedWeb = true;
            }
        } catch (e) {
            console.error('Web verification check failed:', e);
        }

        const isVerified = isVerifiedAPI || isVerifiedWeb;

        // DEBUG: Log the final detection result
        console.log(`[Telegram Detection 2026] Result for ${identifier}: API=${isVerifiedAPI}, Web=${isVerifiedWeb} -> Final=${isVerified}`);

        // Map API types to directory types
        let type: 'channel' | 'group' | 'bot' = 'channel';
        if (result.type === 'channel') {
            type = 'channel';
        } else if (result.type === 'supergroup' || result.type === 'group') {
            type = 'group';
        } else if (result.type === 'private') {
            type = 'bot';
        }

        // 3. Fetch Member Count (if applicable)
        let membersCount = 0;
        if (type !== 'bot') {
            try {
                const countRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${chatId}`);
                const countData = await countRes.json();
                if (countData.ok) {
                    membersCount = countData.result;
                }
            } catch (e) {
                console.error('Error fetching member count:', e);
            }
        }

        // 4. Process Image (if available)
        let processedImageUrl = '';
        if (result.photo?.big_file_id) {
            const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${result.photo.big_file_id}`);
            const fileData = await fileRes.json();

            if (fileData.ok && fileData.result.file_path) {
                const imgDownloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
                const imgRes = await fetch(imgDownloadUrl);
                const buffer = await imgRes.arrayBuffer();

                // Convert to WebP and Compress
                const processedBuffer = await sharp(Buffer.from(buffer))
                    .resize(512, 512, { fit: 'cover' })
                    .webp({ quality: 80 })
                    .toBuffer();

                // Upload to Supabase
                const supabase = await createClient();
                const fileName = `${Math.random().toString(36).substring(2)}.webp`;
                const filePath = `directory/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, processedBuffer, {
                        contentType: 'image/webp',
                        upsert: true
                    });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(filePath);
                    processedImageUrl = publicUrl;
                }
            }
        }

        return {
            success: true,
            data: {
                title,
                description,
                image_url: processedImageUrl,
                type,
                is_verified: !!isVerified,
                members_count: membersCount,
                link: `https://t.me/${identifier}`
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
