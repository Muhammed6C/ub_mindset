<?php

namespace App\Http\Requests\Auth;

use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation de la connexion au back-office.
 *
 * - Limite la taille des entrées (anti-DoS / anti-bruteforce) ;
 * - Refuse tout contenu HTML (anti-XSS / anti-injection).
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:150', new NoHtml],
            'password' => ['required', 'string', 'min:8', 'max:100'],
            'device_name' => ['nullable', 'string', 'max:100', new NoHtml],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    /**
     * Message générique : ne jamais révéler si l'email existe.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Identifiants invalides.',
            'email.email' => 'Identifiants invalides.',
        ];
    }
}
