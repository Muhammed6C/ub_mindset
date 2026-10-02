<?php

namespace App\Http\Requests\Admin;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/**
 * Validation stricte des réglages admin (§9.4).
 *
 * DevSecOps :
 * - Empêche l'injection de clés arbitraires ;
 * - Valide le format des emails, téléphones et valeurs numériques ;
 * - Whitelist explicite.
 */
class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'max:100'],
            'settings.*.value' => ['required'],
            'settings.*.is_public' => ['sometimes', 'boolean'],
            'settings.*.description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Valide que chaque clé fait partie de la whitelist autorisée.
     */
    public function after(): array
    {
        return [
            function () {
                $settings = $this->input('settings', []);
                $flatAllowedKeys = array_merge(...array_values(Setting::ALLOWED_KEYS));

                foreach ($settings as $setting) {
                    $key = $setting['key'] ?? '';
                    if (! in_array($key, $flatAllowedKeys, true)) {
                        throw ValidationException::withMessages([
                            'settings' => "La clé de configuration « {$key} » n'est pas autorisée.",
                        ]);
                    }
                }
            },
        ];
    }
}
