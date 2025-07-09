import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, Tag, Layers } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CustomSelect from "@/components/ui/custom-select";
import api from '@/lib/axios';

interface Categoria {
  id: number;
  name: string;
  description?: string;
}

interface GrupoAdicional {
  id: number;
  name: string;
  product_type: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: Opcao[];
}

interface Opcao {
  id: number;
  name: string;
  additional_price: number;
  description?: string;
  is_available: boolean;
  group_id?: number;
}

interface Produto {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: Categoria;
  additional_groups: GrupoAdicional[];
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("produtos");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [gruposAdicionais, setGruposAdicionais] = useState<GrupoAdicional[]>([]);
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  
  // Estados para formulários
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [formKey, setFormKey] = useState(0); // Key para forçar re-render do formulário
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const establishmentId = user?.id;

      // Buscar produtos
      const produtosResponse = await api.get(`/products?establishment_id=${establishmentId}`);
      setProdutos(produtosResponse.data.products || []);

      // Buscar categorias
      const categoriasResponse = await api.get('/categories');
      setCategorias(categoriasResponse.data.categories || []);

      // Buscar grupos de adicionais
      const gruposResponse = await api.get(`/option-groups?establishment_id=${establishmentId}`);
      setGruposAdicionais(gruposResponse.data.groups || []);

      // Buscar opções
      const opcoesResponse = await api.get(`/options?establishment_id=${establishmentId}`);
      setOpcoes(opcoesResponse.data.options || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ESTABLISHMENT') {
      return;
    }
    
    fetchData();
  }, [isAuthenticated, user, fetchData]);

  const validateForm = () => {
    const errors: any = {};
    
    if (activeTab === 'produtos') {
      if (!formData.name?.trim()) errors.name = 'Nome é obrigatório';
      if (!formData.price || formData.price <= 0) errors.price = 'Preço deve ser maior que zero';
      if (!formData.category_id) errors.category_id = 'Categoria é obrigatória';
    }
    
    if (activeTab === 'categorias') {
      if (!formData.name?.trim()) errors.name = 'Nome é obrigatório';
    }
    
    if (activeTab === 'grupos') {
      if (!formData.name?.trim()) errors.name = 'Nome é obrigatório';
      if (!formData.product_type?.trim()) errors.product_type = 'Tipo é obrigatório';
      if (formData.min_selections < 0) errors.min_selections = 'Mínimo deve ser zero ou maior';
      if (formData.max_selections < formData.min_selections) {
        errors.max_selections = 'Máximo deve ser maior ou igual ao mínimo';
      }
    }
    
    if (activeTab === 'opcoes') {
      if (!formData.name?.trim()) errors.name = 'Nome é obrigatório';
      if (!formData.additional_price || formData.additional_price < 0) {
        errors.additional_price = 'Preço adicional deve ser zero ou maior';
      }
      if (!formData.group_id) errors.group_id = 'Grupo é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = (type: string) => {
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
    setFormKey(prev => prev + 1); // Força re-render do formulário
    setShowForm(true);
    setActiveTab(type);
    setImageFile(null);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setFormData({...item});
    setFormErrors({});
    setFormKey(prev => prev + 1); // Força re-render do formulário
    setShowForm(true);
    setActiveTab(type);
    setImageFile(null);
  };

  const handleDelete = async (id: number, type: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const endpoint = getEndpoint(type);
      await api.delete(`${endpoint}/${id}`);
      
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso!",
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Não foi possível excluir o item.",
        variant: "destructive"
      });
    }
  };

  const getEndpoint = (type: string) => {
    switch (type) {
      case 'produtos': return 'http://localhost:3001/api/products';
      case 'categorias': return 'http://localhost:3001/api/categories';
      case 'grupos': return 'http://localhost:3001/api/option-groups';
      case 'opcoes': return 'http://localhost:3001/api/options';
      default: return '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }
    try {
      setSubmitting(true);
      const endpoint = getEndpoint(activeTab);
      const method = editingItem ? 'put' : 'post';
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
      let response;
      if (activeTab === 'produtos') {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'additional_groups') {
            const groupArr = Array.isArray(value) ? value : [];
            form.append('additional_groups', JSON.stringify(groupArr.map((g: any) => g.id)));
          } else {
            form.append(key, value !== undefined && value !== null ? String(value) : '');
          }
        });
        if (imageFile) {
          form.append('image', imageFile);
        }
        form.append('establishment_id', String(user?.id));
        response = await api.request({
          url,
          method,
          data: form,
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // --- NOVO: Atualizar grupos de adicionais após criar/editar produto ---
        // Pega o ID do produto criado/atualizado
        const productId = editingItem ? editingItem.id : response.data.id;
        const groupIds = (formData.additional_groups || []).map((g: any) => g.id);
        await api.put(`/products/${productId}/groups`, { group_ids: groupIds });
        // --- FIM NOVO ---
      } else {
        const payload = {
          ...formData,
          establishment_id: user?.id
        };
        response = await api[method](url, payload);
      }
      toast({
        title: "Sucesso",
        description: editingItem ? "Item atualizado com sucesso!" : "Item criado com sucesso!",
      });
      setShowForm(false);
      setFormData({});
      setFormErrors({});
      setFormKey(prev => prev + 1);
      setImageFile(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Não foi possível salvar o item.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({...formData, [field]: value});
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: ''});
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({});
    setFormErrors({});
    setFormKey(prev => prev + 1);
  };

  // Preparar opções para os selects
  const categoriaOptions = categorias.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  const grupoOptions = gruposAdicionais.map(grupo => ({
    value: grupo.id.toString(),
    label: grupo.name
  }));

  if (!isAuthenticated || user?.role !== 'ESTABLISHMENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center mb-4">Acesso Negado</h2>
            <p className="text-gray-600 text-center">
              Você precisa ser um estabelecimento para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Painel de <span className="text-orange-600">Administração</span>
          </h1>
          <p className="text-gray-600 text-center">
            Gerencie seus produtos, categorias e grupos de adicionais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="grupos" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="opcoes" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Opções
            </TabsTrigger>
          </TabsList>

          {/* Tab Produtos */}
          <TabsContent value="produtos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos</CardTitle>
                <Button onClick={() => handleCreate('produtos')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {produtos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum produto cadastrado ainda.
                      </div>
                    ) : (
                      produtos.map((produto) => (
                        <div key={`produto-${produto.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{produto.name}</h3>
                            <p className="text-sm text-gray-600">{produto.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{produto.category?.name}</Badge>
                              <Badge variant="secondary">
                                R$ {typeof produto.price === 'number' ? produto.price.toFixed(2) : parseFloat(produto.price || 0).toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(produto, 'produtos')}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(produto.id, 'produtos')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Categorias */}
          <TabsContent value="categorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categorias</CardTitle>
                <Button onClick={() => handleCreate('categorias')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {categorias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma categoria cadastrada ainda.
                    </div>
                  ) : (
                    categorias.map((categoria) => (
                      <div key={`categoria-${categoria.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{categoria.name}</h3>
                          {categoria.description && (
                            <p className="text-sm text-gray-600">{categoria.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(categoria, 'categorias')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(categoria.id, 'categorias')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Grupos */}
          <TabsContent value="grupos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Grupos de Adicionais</CardTitle>
                <Button onClick={() => handleCreate('grupos')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {gruposAdicionais.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum grupo de adicional cadastrado ainda.
                    </div>
                  ) : (
                    gruposAdicionais.map((grupo) => (
                      <div key={`grupo-${grupo.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{grupo.name}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{grupo.product_type}</Badge>
                            <Badge variant="secondary">
                              {grupo.min_selections}-{grupo.max_selections} seleções
                            </Badge>
                            {grupo.is_required && <Badge variant="destructive">Obrigatório</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(grupo, 'grupos')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(grupo.id, 'grupos')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Opções */}
          <TabsContent value="opcoes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Opções de Adicionais</CardTitle>
                <Button onClick={() => handleCreate('opcoes')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Opção
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {opcoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma opção cadastrada ainda.
                    </div>
                  ) : (
                    opcoes.map((opcao) => (
                      <div key={`opcao-${opcao.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{opcao.name}</h3>
                          {opcao.description && (
                            <p className="text-sm text-gray-600">{opcao.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">
                              R$ {typeof opcao.additional_price === 'number' ? opcao.additional_price.toFixed(2) : parseFloat(opcao.additional_price || 0).toFixed(2)}
                            </Badge>
                            {opcao.is_available ? (
                              <Badge variant="default">Disponível</Badge>
                            ) : (
                              <Badge variant="destructive">Indisponível</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(opcao, 'opcoes')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(opcao.id, 'opcoes')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingItem ? 'Editar' : 'Criar'} {activeTab.slice(0, -1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
                  {/* Campos específicos para cada tipo */}
                  {activeTab === 'produtos' && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome do Produto</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={formErrors.name ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Preço</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className={formErrors.price ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.price && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="category_id">Categoria</Label>
                        <CustomSelect
                          value={formData.category_id?.toString() || ''}
                          onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                          placeholder="Selecione uma categoria"
                          options={categoriaOptions}
                          error={!!formErrors.category_id}
                        />
                        {formErrors.category_id && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.category_id}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <Label>Foto do Produto</Label>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                        {imageFile && (
                          <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                        )}
                        {!imageFile && formData.image_url && (
                          <img src={formData.image_url.startsWith('/uploads')
                            ? `https://painelquick.vmagenciadigital.com/painelquick${formData.image_url}`
                            : formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                        )}
                      </div>
                      <div>
                        <Label>Grupos de Adicionais</Label>
                        <div className="flex flex-wrap gap-2">
                          {gruposAdicionais.map(grupo => (
                            <label key={grupo.id} className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={!!formData.additional_groups?.some((g: any) => g.id === grupo.id)}
                                onChange={e => {
                                  let newGroups = formData.additional_groups ? [...formData.additional_groups] : [];
                                  if (e.target.checked) {
                                    newGroups.push(grupo);
                                  } else {
                                    newGroups = newGroups.filter((g: any) => g.id !== grupo.id);
                                  }
                                  handleInputChange('additional_groups', newGroups);
                                }}
                              />
                              {grupo.name}
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Selecione um ou mais grupos para associar ao produto.</p>
                      </div>
                    </>
                  )}

                  {activeTab === 'categorias' && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome da Categoria</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={formErrors.name ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'grupos' && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome do Grupo</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={formErrors.name ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="product_type">Tipo</Label>
                        <Input
                          id="product_type"
                          value={formData.product_type || ''}
                          onChange={(e) => handleInputChange('product_type', e.target.value)}
                          className={formErrors.product_type ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.product_type && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.product_type}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_selections">Mínimo de Seleções</Label>
                          <Input
                            id="min_selections"
                            type="number"
                            min="0"
                            value={formData.min_selections || 0}
                            onChange={(e) => handleInputChange('min_selections', parseInt(e.target.value) || 0)}
                            className={formErrors.min_selections ? 'border-red-500' : ''}
                            required
                          />
                          {formErrors.min_selections && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.min_selections}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="max_selections">Máximo de Seleções</Label>
                          <Input
                            id="max_selections"
                            type="number"
                            min="1"
                            value={formData.max_selections || 1}
                            onChange={(e) => handleInputChange('max_selections', parseInt(e.target.value) || 1)}
                            className={formErrors.max_selections ? 'border-red-500' : ''}
                            required
                          />
                          {formErrors.max_selections && (
                            <p className="text-sm text-red-500 mt-1">{formErrors.max_selections}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_required"
                          checked={formData.is_required || false}
                          onChange={(e) => handleInputChange('is_required', e.target.checked)}
                        />
                        <Label htmlFor="is_required">Obrigatório</Label>
                      </div>
                    </>
                  )}

                  {activeTab === 'opcoes' && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome da Opção</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={formErrors.name ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="additional_price">Preço Adicional</Label>
                        <Input
                          id="additional_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.additional_price || ''}
                          onChange={(e) => handleInputChange('additional_price', parseFloat(e.target.value) || 0)}
                          className={formErrors.additional_price ? 'border-red-500' : ''}
                          required
                        />
                        {formErrors.additional_price && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.additional_price}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="group_id">Grupo</Label>
                        <CustomSelect
                          value={formData.group_id?.toString() || ''}
                          onValueChange={(value) => handleInputChange('group_id', parseInt(value))}
                          placeholder="Selecione um grupo"
                          options={grupoOptions}
                          error={!!formErrors.group_id}
                        />
                        {formErrors.group_id && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.group_id}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_available"
                          checked={formData.is_available !== false}
                          onChange={(e) => handleInputChange('is_available', e.target.checked)}
                        />
                        <Label htmlFor="is_available">Disponível</Label>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={closeForm}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 