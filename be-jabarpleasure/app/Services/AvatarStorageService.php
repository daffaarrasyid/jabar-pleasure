<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AvatarStorageService
{
    public const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    private const MAX_DIMENSION = 512;
    private const WEBP_QUALITY = 80;

    /**
     * Validate size, compress/resize to WebP, and upload to Supabase Storage.
     *
     * @throws \RuntimeException when file exceeds 2MB, is invalid, or upload fails.
     */
    public function uploadCompressedWebp(UploadedFile $file, int $userId, ?string $previousAvatarUrl = null): string
    {
        $size = $file->getSize();
        if ($size === false || $size > self::MAX_BYTES) {
            throw new \RuntimeException('Ukuran file foto profil maksimal 2 MB.', 413);
        }

        $webpBinary = $this->convertToWebp($file);

        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $supabaseKey = (string) config('services.supabase.key');
        $bucket = (string) config('services.supabase.bucket', 'destinations');

        if ($supabaseUrl === '' || $supabaseKey === '') {
            throw new \RuntimeException('Konfigurasi Supabase storage belum lengkap.', 500);
        }

        $objectPath = sprintf('avatars/user_%d_%d_%s.webp', $userId, time(), Str::lower(Str::random(6)));
        $uploadEndpoint = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$objectPath}";

        $response = Http::withHeaders([
            'apikey' => $supabaseKey,
            'Authorization' => 'Bearer ' . $supabaseKey,
            'Content-Type' => 'image/webp',
            'x-upsert' => 'true',
        ])->withBody($webpBinary, 'image/webp')->post($uploadEndpoint);

        if (!$response->successful()) {
            Log::error('Supabase avatar upload failed', [
                'user_id' => $userId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Gagal mengunggah foto profil ke penyimpanan.', 502);
        }

        $publicUrl = "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$objectPath}";

        if ($previousAvatarUrl && $previousAvatarUrl !== $publicUrl) {
            $this->deleteIfManagedSupabaseAvatar($previousAvatarUrl);
        }

        return $publicUrl;
    }

    /**
     * Delete an old avatar from Supabase Storage if it belongs to our managed avatars/ prefix.
     */
    public function deleteIfManagedSupabaseAvatar(?string $avatarUrl): void
    {
        if (!$avatarUrl) {
            return;
        }

        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $supabaseKey = (string) config('services.supabase.key');
        $bucket = (string) config('services.supabase.bucket', 'destinations');

        if ($supabaseUrl === '' || $supabaseKey === '') {
            return;
        }

        $publicPrefix = "{$supabaseUrl}/storage/v1/object/public/{$bucket}/";
        if (!str_starts_with($avatarUrl, $publicPrefix)) {
            return;
        }

        $objectPath = substr($avatarUrl, strlen($publicPrefix));
        if (!str_starts_with($objectPath, 'avatars/')) {
            return;
        }

        try {
            $deleteEndpoint = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$objectPath}";
            Http::withHeaders([
                'apikey' => $supabaseKey,
                'Authorization' => 'Bearer ' . $supabaseKey,
            ])->delete($deleteEndpoint);
        } catch (\Throwable $e) {
            Log::warning('Failed to delete previous Supabase avatar', [
                'path' => $objectPath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Decode uploaded image, resize to fit within MAX_DIMENSION, and encode as WebP.
     */
    private function convertToWebp(UploadedFile $file): string
    {
        $realPath = $file->getRealPath();
        if ($realPath === false || !is_readable($realPath)) {
            throw new \RuntimeException('File gambar tidak dapat dibaca.', 422);
        }

        $raw = file_get_contents($realPath);
        if ($raw === false) {
            throw new \RuntimeException('Gagal membaca isi file gambar.', 422);
        }

        $source = @imagecreatefromstring($raw);
        if ($source === false) {
            throw new \RuntimeException('Format gambar tidak valid atau rusak.', 422);
        }

        try {
            $origWidth = imagesx($source);
            $origHeight = imagesy($source);

            if ($origWidth <= 0 || $origHeight <= 0) {
                throw new \RuntimeException('Dimensi gambar tidak valid.', 422);
            }

            [$targetWidth, $targetHeight] = $this->calculateDimensions($origWidth, $origHeight);

            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            if ($canvas === false) {
                throw new \RuntimeException('Gagal memproses kanvas gambar.', 500);
            }

            try {
                imagealphablending($canvas, false);
                imagesavealpha($canvas, true);
                $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
                imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);

                imagecopyresampled(
                    $canvas,
                    $source,
                    0,
                    0,
                    0,
                    0,
                    $targetWidth,
                    $targetHeight,
                    $origWidth,
                    $origHeight
                );

                ob_start();
                $encoded = imagewebp($canvas, null, self::WEBP_QUALITY);
                $webpData = ob_get_clean();

                if (!$encoded || $webpData === false || $webpData === '') {
                    throw new \RuntimeException('Gagal mengompresi gambar ke format WebP.', 500);
                }

                return $webpData;
            } finally {
                imagedestroy($canvas);
            }
        } finally {
            imagedestroy($source);
        }
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function calculateDimensions(int $width, int $height): array
    {
        $max = self::MAX_DIMENSION;
        if ($width <= $max && $height <= $max) {
            return [$width, $height];
        }

        if ($width >= $height) {
            $newWidth = $max;
            $newHeight = max(1, (int) round(($height / $width) * $max));
        } else {
            $newHeight = $max;
            $newWidth = max(1, (int) round(($width / $height) * $max));
        }

        return [$newWidth, $newHeight];
    }
}

